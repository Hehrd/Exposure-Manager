package com.project.org.service;

import com.project.org.controller.dto.request.database.DatabaseCreateReqDTO;
import com.project.org.controller.dto.request.database.DatabaseUpdateReqDTO;
import com.project.org.controller.dto.response.DefaultDatabaseResDTO;
import com.project.org.controller.dto.response.PagedResponse;
import com.project.org.error.exception.InsufficientPrivilegeForDatabaseException;
import com.project.org.error.exception.NotFoundException;
import com.project.org.persistence.entity.DatabaseEntity;
import com.project.org.persistence.entity.UserEntity;
import com.project.org.persistence.repository.DatabaseRepository;
import com.project.org.persistence.repository.UserRepository;
import com.project.org.security.JwtUser;
import com.project.org.util.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;


@Service
public class DatabaseService extends DataService{
    @Autowired
    public DatabaseService(RestTemplate restTemplate,
                           JwtService jwtService,
                           JobService jobService,
                           UserRepository userRepository,
                           DatabaseRepository databaseRepository) {
        super(restTemplate,
                jwtService,
                userRepository,
                databaseRepository,
                jobService,
                "http://localhost:19000/databases");
    }


    public PagedResponse<DefaultDatabaseResDTO> getDatabases(int page, int size, String jwt) throws NotFoundException {
        JwtUser jwtUser = jwtService.extractUser(jwt);
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<DatabaseEntity> databaseEntityPage = databaseRepository.findAllByAllowedRolesContaining(jwtUser.getRole(), pageable);
        List<DefaultDatabaseResDTO> databaseResDTOs = new ArrayList<>();
        for (DatabaseEntity databaseEntity : databaseEntityPage) {
            databaseResDTOs.add(ObjectMapper.toDTO(databaseEntity));
        }
        PagedResponse<DefaultDatabaseResDTO> pagedResponse = new PagedResponse<>();
        pagedResponse.setContent(databaseResDTOs);
        pagedResponse.setTotalElements(databaseEntityPage.getTotalElements());
        pagedResponse.setPageNumber(page);
        pagedResponse.setPageSize(size);
        return pagedResponse;
    }

    public void createDatabase(List<DatabaseCreateReqDTO> reqDTOs, String jwt) throws NotFoundException {
        JwtUser jwtUser = jwtService.extractUser(jwt);
        Long userId = jwtUser.getId();
        UserEntity userEntity = userRepository.findById(userId).orElseThrow(
                () -> new NotFoundException(String.format("User %s not found!", jwtUser.getUsername())));
        for (DatabaseCreateReqDTO reqDTO : reqDTOs) {
            reqDTO.setName(reqDTO.getName().toLowerCase());
        }
        Long jobId = jobService.startJob(createJob("create_databases", System.currentTimeMillis()), jwt);
        URI url = UriComponentsBuilder.fromUriString(DATA_MANAGER_URL)
                .queryParam("jobId", jobId)
                .build()
                .toUri();
        CompletableFuture<ResponseEntity<Void>> future = sendReqToDatamanager(HttpMethod.POST, url, reqDTOs, jwt,
                new ParameterizedTypeReference<Void>() {});
        future.thenAccept(res -> {
            if (res.getStatusCode().value() == HttpStatus.CREATED.value()) {
                saveDatabases(reqDTOs, userEntity);
            }
        });
    }

    @Transactional
    public void deleteDatabases(List<String> databaseNames, String jwt) throws NotFoundException, InsufficientPrivilegeForDatabaseException {
        JwtUser jwtUser = jwtService.extractUser(jwt);
        verifyDatabases(databaseNames, jwtUser);
        Long jobId = jobService.startJob(createJob("delete_databases", System.currentTimeMillis()), jwt);
        URI url = UriComponentsBuilder.fromUriString(DATA_MANAGER_URL)
                .queryParam("jobId", jobId)
                .build()
                .toUri();
        CompletableFuture<ResponseEntity<Void>> future = sendReqToDatamanager(HttpMethod.DELETE, url,
                databaseNames,
                jwt,
                new ParameterizedTypeReference<Void>() {});
        future.thenAccept(res -> {
            if (res.getStatusCode().value() == HttpStatus.NO_CONTENT.value()) {
                for (String databaseName : databaseNames) {
                    databaseRepository.deleteByNameAndOwner_Id(databaseName, jwtUser.getId());
                }
            }
        });
    }

    public void updateDatabase(List<DatabaseUpdateReqDTO> reqDTOs, String jwt) throws NotFoundException, InsufficientPrivilegeForDatabaseException {
        JwtUser jwtUser = jwtService.extractUser(jwt);
        List<String> databaseOldNames = new ArrayList<>();
        for (DatabaseUpdateReqDTO reqDTO : reqDTOs) {
            reqDTO.setNewName(reqDTO.getNewName().toLowerCase());
            reqDTO.setOldName(reqDTO.getOldName().toLowerCase());
            databaseOldNames.add(reqDTO.getOldName());
        }
        verifyDatabases(databaseOldNames, jwtUser);
        Long jobId = jobService.startJob(createJob("update_databases", System.currentTimeMillis()), jwt);
        URI url = UriComponentsBuilder.fromUriString(DATA_MANAGER_URL)
                .queryParam("jobId", jobId)
                .build()
                .toUri();
        CompletableFuture<ResponseEntity<Void>> future = sendReqToDatamanager(HttpMethod.PUT,
                url,
                reqDTOs,
                jwt,
                new ParameterizedTypeReference<Void>() {});
        future.thenAccept(res -> {
            if (res.getStatusCode().value() == HttpStatus.OK.value()) {
                try {
                    updateDatabases(reqDTOs, jwtUser.getId());
                } catch (NotFoundException e) {
                    System.out.println(e.getMessage());
                }
            }
        });
    }

    private void verifyDatabases(List<String> databaseNames, JwtUser jwtUser) throws NotFoundException, InsufficientPrivilegeForDatabaseException {
        for (String databaseName : databaseNames) {
            if (!databaseRepository.existsByNameAndOwner_Id(databaseName, jwtUser.getId())) {
                throw new NotFoundException(String.format("Database with name %s not found!", databaseName));
            }
            validateRole(jwtUser.getRole(), databaseName);
        }
    }

    private void saveDatabases(List<DatabaseCreateReqDTO> reqDTOs, UserEntity userEntity) {
        for (DatabaseCreateReqDTO reqDTO : reqDTOs) {
            DatabaseEntity databaseEntity = ObjectMapper.toEntity(reqDTO);
            databaseEntity.setOwner(userEntity);
            databaseEntity.setAllowedRoles(reqDTO.getAllowedRoles());
            databaseRepository.save(databaseEntity);
        }

    }

    private void updateDatabases(List<DatabaseUpdateReqDTO> reqDTOs, Long userId) throws NotFoundException {
        for (DatabaseUpdateReqDTO reqDTO : reqDTOs) {
            DatabaseEntity databaseEntity =
                    databaseRepository.findByNameAndOwner_Id(reqDTO.getOldName(), userId).orElseThrow(
                    () -> new NotFoundException(String.format("Database %s not found!", reqDTO.getOldName())));
            databaseEntity.setName(reqDTO.getNewName());
            databaseEntity.setAllowedRoles(reqDTO.getAllowedRoles());
            databaseRepository.save(databaseEntity);
        }
    }





}
