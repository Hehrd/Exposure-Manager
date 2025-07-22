package com.project.org.service;

import com.project.org.controller.dto.request.location.LocationCreateReqDTO;
import com.project.org.controller.dto.request.location.LocationUpdateReqDTO;
import com.project.org.controller.dto.response.DefaultLocationResDTO;
import com.project.org.error.exception.NotFoundException;
import com.project.org.persistence.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.List;

@Service
public class LocationService extends DataService {
    @Autowired
    public LocationService(RestTemplate restTemplate,
                           JwtService jwtService,
                           UserRepository userRepository) {
        super(restTemplate, jwtService, userRepository, "http://localhost:19000/locations");
    }

    public ResponseEntity<List<DefaultLocationResDTO>> getLocations(int page,
                                                                    int size,
                                                                    String databaseName,
                                                                    Long accountId,
                                                                    String jwt) throws NotFoundException {
        String username = jwtService.extractUsername(jwt);
        Long userId = getUserId(username);
        URI url = UriComponentsBuilder.fromUriString(DATA_MANAGER_URL)
                .queryParam("page", page)
                .queryParam("size", size)
                .queryParam("databaseName", databaseName)
                .queryParam("accountId", accountId)
                .build()
                .toUri();
        return sendReqToDatamanager(HttpMethod.GET, url, null, userId,
                new ParameterizedTypeReference<List<DefaultLocationResDTO>>() {});
    }

    public ResponseEntity<Void> createLocations(List<LocationCreateReqDTO> locations,
                                                                       String databaseName,
                                                                       String jwt) throws NotFoundException {
        String username = jwtService.extractUsername(jwt);
        Long userId = getUserId(username);

        URI url = UriComponentsBuilder.fromUriString(DATA_MANAGER_URL)
                .queryParam("databaseName", databaseName)
                .build()
                .toUri();
        return sendReqToDatamanager(HttpMethod.POST, url, locations, userId,
                new ParameterizedTypeReference<Void>() {});
    }


    public ResponseEntity<Void> updateLocation(List<LocationUpdateReqDTO> locations,
                                                                      String databaseName,
                                                                      String jwt) throws NotFoundException {
        String username = jwtService.extractUsername(jwt);
        Long userId = getUserId(username);
        URI url = UriComponentsBuilder.fromUriString(DATA_MANAGER_URL)
                .queryParam("databaseName", databaseName)
                .build()
                .toUri();
        return sendReqToDatamanager(HttpMethod.PUT, url, locations, userId,
                new ParameterizedTypeReference<Void>() {});
    }

    public ResponseEntity<Void> deleteLocation(List<Long> locationIds, String databaseName, String jwt) throws NotFoundException {
        String username = jwtService.extractUsername(jwt);
        Long userId = getUserId(username);
        URI url = UriComponentsBuilder.fromUriString(DATA_MANAGER_URL)
                .queryParam("databaseName", databaseName)
                .build()
                .toUri();
        return sendReqToDatamanager(HttpMethod.DELETE, url, locationIds, userId,
                new ParameterizedTypeReference<Void>() {});
    }
}
