package com.project.org.service;

import com.project.org.controller.dto.request.database.DatabaseCreateReqDTO;
import com.project.org.controller.dto.request.database.DatabaseUpdateReqDTO;
import com.project.org.controller.dto.response.DefaultDatabaseResDTO;
import com.project.org.error.exception.NotFoundException;
import com.project.org.persistence.entity.DatabaseEntity;
import com.project.org.persistence.entity.UserEntity;
import com.project.org.persistence.repository.DatabaseRepository;
import com.project.org.persistence.repository.UserRepository;
import com.project.org.util.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;


@Service
public class DatabaseService extends DataService{
    private final DatabaseRepository databaseRepository;

    @Autowired
    public DatabaseService(RestTemplate restTemplate,
                           JwtService jwtService,
                           UserRepository userRepository, DatabaseRepository databaseRepository) {
        super(restTemplate,
                jwtService,
                userRepository,
                "http://localhost:19000/databases");
        this.databaseRepository = databaseRepository;
    }


    public List<DefaultDatabaseResDTO> getDatabases(int page, int size, String jwt) {
        String username = jwtService.extractUsername(jwt);
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<DatabaseEntity> databaseEntitiesPage = databaseRepository.findAllByOwner_Username(username, pageable);
        List<DatabaseEntity> databaseEntities = databaseEntitiesPage.getContent();
        List<DefaultDatabaseResDTO> databaseResDTOs = new ArrayList<>();
        for (DatabaseEntity databaseEntity : databaseEntities) {
            databaseResDTOs.add(ObjectMapper.toDTO(databaseEntity));
        }
        return databaseResDTOs;
    }

    public ResponseEntity<Void> createDatabase(List<DatabaseCreateReqDTO> reqDTOs, String jwt) throws NotFoundException {
        String username = jwtService.extractUsername(jwt);
        UserEntity userEntity = userRepository.findByUsername(username).orElseThrow(
                () -> new NotFoundException(String.format("User %s not found!", username)));
        ResponseEntity<Void> res = sendReqToDatamanager(HttpMethod.POST,
                URI.create(DATA_MANAGER_URL),
                reqDTOs,
                userEntity.getId(),
                new ParameterizedTypeReference<Void>() {});
        if (res.getStatusCode().value() == HttpStatus.CREATED.value()) {
            saveDatabases(reqDTOs, userEntity);
        }
        return res;
    }

    public ResponseEntity<Void> deleteDatabaseById(List<String> databaseNames, String jwt) throws NotFoundException {
        String username = jwtService.extractUsername(jwt);
        Long userId = getUserId(username);
        verifyDatabases(databaseNames, userId);
        ResponseEntity<Void> res = sendReqToDatamanager(HttpMethod.DELETE,
                URI.create(DATA_MANAGER_URL),
                databaseNames,
                null,
                new ParameterizedTypeReference<Void>() {});

        if (res.getStatusCode().value() == HttpStatus.NO_CONTENT.value()) {
            for (String databaseName : databaseNames) {
                databaseRepository.deleteByNameAndOwner_Id(databaseName, userId);
            }
        }
        return res;
    }

    public ResponseEntity<Void> updateDatabase(List<DatabaseUpdateReqDTO> reqDTOs, String jwt) throws NotFoundException {
        String username = jwtService.extractUsername(jwt);
        Long userId = getUserId(username);
        List<String> databaseOldNames = new ArrayList<>();
        for (DatabaseUpdateReqDTO reqDTO : reqDTOs) {
            databaseOldNames.add(reqDTO.getOldName());
        }
        verifyDatabases(databaseOldNames, userId);
        ResponseEntity<Void> res = sendReqToDatamanager(HttpMethod.PUT,
                URI.create(DATA_MANAGER_URL),
                reqDTOs,
                null,
                new ParameterizedTypeReference<Void>() {});
        if (res.getStatusCode().value() == HttpStatus.OK.value()) {
            updateDatabases(reqDTOs, userId);
        }
        return res;
    }

    private void verifyDatabases(List<String> databaseNames, Long userId) throws NotFoundException {
        for (String databaseName : databaseNames) {
            if (!databaseRepository.existsByNameAndOwner_Id(databaseName, userId)) {
                throw new NotFoundException(String.format("Database with name %s not found!", databaseName));
            }
        }
    }

    private void saveDatabases(List<DatabaseCreateReqDTO> reqDTOs, UserEntity userEntity) {
        for (DatabaseCreateReqDTO reqDTO : reqDTOs) {
            DatabaseEntity databaseEntity = ObjectMapper.toEntity(reqDTO);
            databaseEntity.setOwner(userEntity);
            databaseRepository.save(databaseEntity);
        }

    }

    private void updateDatabases(List<DatabaseUpdateReqDTO> reqDTOs, Long userId) throws NotFoundException {
        for (DatabaseUpdateReqDTO reqDTO : reqDTOs) {
            DatabaseEntity databaseEntity =
                    databaseRepository.findByNameAndOwner_Id(reqDTO.getOldName(), userId).orElseThrow(
                    () -> new NotFoundException(String.format("Database %s not found!", reqDTO.getOldName())));
            databaseEntity.setName(reqDTO.getNewName());
            databaseRepository.save(databaseEntity);
        }
    }


}
