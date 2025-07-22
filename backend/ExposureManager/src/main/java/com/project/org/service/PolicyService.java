package com.project.org.service;

import com.project.org.controller.dto.request.policy.PolicyCreateReqDTO;
import com.project.org.controller.dto.request.policy.PolicyUpdateReqDTO;
import com.project.org.controller.dto.response.DefaultPolicyResDTO;
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
public class PolicyService extends DataService {
    @Autowired
    public PolicyService(RestTemplate restTemplate,
                         JwtService jwtService,
                         UserRepository userRepository) {
        super(restTemplate, jwtService, userRepository, "http://localhost:19000/policies");
    }

    public ResponseEntity<List<DefaultPolicyResDTO>> getPolicies(int page,
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
                new ParameterizedTypeReference<List<DefaultPolicyResDTO>>() {});
    }

    public ResponseEntity<Void> createPolicy(List<PolicyCreateReqDTO> policies,
                                                                  String databaseName,
                                                                  String jwt) throws NotFoundException {
        String username = jwtService.extractUsername(jwt);
        Long userId = getUserId(username);
        URI url = UriComponentsBuilder.fromUriString(DATA_MANAGER_URL)
                .queryParam("databaseName", databaseName)
                .build()
                .toUri();
        return sendReqToDatamanager(HttpMethod.POST, url, policies, userId,
                new ParameterizedTypeReference<Void>() {});
    }

    public ResponseEntity<Void> updatePolicy(List<PolicyUpdateReqDTO> policies,
                                                                  String databaseName,
                                                                  String jwt) throws NotFoundException {
        String username = jwtService.extractUsername(jwt);
        Long userId = getUserId(username);
        URI url = UriComponentsBuilder
                .fromUriString(DATA_MANAGER_URL)
                .queryParam("databaseName", databaseName)
                .build()
                .toUri();
        return sendReqToDatamanager(HttpMethod.PUT, url, policies, userId,
                new ParameterizedTypeReference<Void>() {});
    }

    public ResponseEntity<Void> deletePolicy(List<Long> policyIds,
                                                                  String databaseName,
                                                                  String jwt) throws NotFoundException {
        String username = jwtService.extractUsername(jwt);
        Long userId = getUserId(username);
        URI url = UriComponentsBuilder.fromUriString(DATA_MANAGER_URL)
                .queryParam("databaseName", databaseName)
                .build()
                .toUri();
        return sendReqToDatamanager(HttpMethod.DELETE, url, policyIds, userId,
                new ParameterizedTypeReference<Void>() {});
    }
}
