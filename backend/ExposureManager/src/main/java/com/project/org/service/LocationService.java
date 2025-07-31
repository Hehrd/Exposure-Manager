package com.project.org.service;

import com.project.org.controller.dto.request.location.LocationCreateReqDTO;
import com.project.org.controller.dto.request.location.LocationUpdateReqDTO;
import com.project.org.controller.dto.response.DefaultLocationResDTO;
import com.project.org.controller.dto.response.PagedResponse;
import com.project.org.error.exception.InsufficientPrivilegeForDatabaseException;
import com.project.org.error.exception.NotFoundException;
import com.project.org.persistence.repository.DatabaseRepository;
import com.project.org.persistence.repository.UserRepository;
import com.project.org.security.JwtUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.concurrent.ExecutionException;

@Service
public class LocationService extends DataService {


    @Autowired
    public LocationService(RestTemplate restTemplate,
                           JwtService jwtService,
                           JobService jobService,
                           UserRepository userRepository,
                           DatabaseRepository databaseRepository, DataManagerClientService dataManagerClientService) {
        super(restTemplate, jwtService, userRepository, databaseRepository, jobService, dataManagerClientService,
                "http://localhost:19000/locations");
    }

    public ResponseEntity<PagedResponse<DefaultLocationResDTO>> getLocations(int page,
                                                                             int size,
                                                                             String databaseName,
                                                                             Long accountId,
                                                                             String jwt) throws NotFoundException, InsufficientPrivilegeForDatabaseException, ExecutionException, InterruptedException {
        JwtUser jwtUser = jwtService.extractUser(jwt);
        validateRole(jwtUser.getRole(), databaseName);
        URI url = UriComponentsBuilder.fromUriString(DATA_MANAGER_URL)
                .queryParam("page", page)
                .queryParam("size", size)
                .queryParam("databaseName", databaseName)
                .queryParam("accountId", accountId)
                .build()
                .toUri();
        return dataManagerClientService.sendReqToDatamanager(HttpMethod.GET, url, null, jwt,
                new ParameterizedTypeReference<PagedResponse<DefaultLocationResDTO>>() {}).get();
    }

    public void createLocations(List<LocationCreateReqDTO> locations,
                                                                       String databaseName,
                                                                       String jwt) throws NotFoundException, InsufficientPrivilegeForDatabaseException {
        JwtUser jwtUser = jwtService.extractUser(jwt);
        validateRole(jwtUser.getRole(), databaseName);
        Long jobId = jobService.startJob(createJob("create_locations", System.currentTimeMillis()), jwt);
        URI url = UriComponentsBuilder.fromUriString(DATA_MANAGER_URL)
                .queryParam("databaseName", databaseName)
                .queryParam("jobId", jobId)
                .build()
                .toUri();
        dataManagerClientService.sendReqToDatamanager(HttpMethod.POST, url, locations, jwt,
                new ParameterizedTypeReference<Void>() {});
    }


    public void updateLocation(List<LocationUpdateReqDTO> locations,
                                                                      String databaseName,
                                                                      String jwt) throws NotFoundException, InsufficientPrivilegeForDatabaseException {
        JwtUser jwtUser = jwtService.extractUser(jwt);
        validateRole(jwtUser.getRole(), databaseName);
        Long jobId = jobService.startJob(createJob("update_locations", System.currentTimeMillis()), jwt);
        URI url = UriComponentsBuilder.fromUriString(DATA_MANAGER_URL)
                .queryParam("databaseName", databaseName)
                .queryParam("jobId", jobId)
                .build()
                .toUri();
        dataManagerClientService.sendReqToDatamanager(HttpMethod.PUT, url, locations, jwt,
                new ParameterizedTypeReference<Void>() {});
    }

    public void deleteLocation(List<Long> locationIds, String databaseName, String jwt) throws NotFoundException, InsufficientPrivilegeForDatabaseException {
        JwtUser jwtUser = jwtService.extractUser(jwt);
        validateRole(jwtUser.getRole(), databaseName);
        Long jobId = jobService.startJob(createJob("delete_locations", System.currentTimeMillis()), jwt);
        URI url = UriComponentsBuilder.fromUriString(DATA_MANAGER_URL)
                .queryParam("databaseName", databaseName)
                .queryParam("jobId", jobId)
                .build()
                .toUri();
        dataManagerClientService.sendReqToDatamanager(HttpMethod.DELETE, url, locationIds, jwt,
                new ParameterizedTypeReference<Void>() {});
    }
}
