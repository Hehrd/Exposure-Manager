package com.project.org.service;

import com.project.org.controller.dto.request.policy.PolicyCreateReqDTO;
import com.project.org.controller.dto.request.policy.PolicyUpdateReqDTO;
import com.project.org.controller.dto.response.DefaultPolicyResDTO;
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
public class PolicyService extends DataService {

    @Autowired
    public PolicyService(RestTemplate restTemplate,
                         JwtService jwtService,
                         JobService jobService,
                         UserRepository userRepository, DatabaseRepository databaseRepository) {
        super(restTemplate, jwtService, userRepository, databaseRepository,
                jobService,
                "http://localhost:19000/policies");
    }

    public ResponseEntity<PagedResponse<DefaultPolicyResDTO>> getPolicies(int page,
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
        return sendReqToDatamanager(HttpMethod.GET, url, null, jwt,
                new ParameterizedTypeReference<PagedResponse<DefaultPolicyResDTO>>() {}).get();
    }

    public void createPolicy(List<PolicyCreateReqDTO> policies,
                                                                  String databaseName,
                                                                  String jwt) throws NotFoundException, InsufficientPrivilegeForDatabaseException {
        JwtUser jwtUser = jwtService.extractUser(jwt);
        validateRole(jwtUser.getRole(), databaseName);
        Long jobId = jobService.startJob(createJob("create_policies", System.currentTimeMillis()), jwt);
        URI url = UriComponentsBuilder.fromUriString(DATA_MANAGER_URL)
                .queryParam("databaseName", databaseName)
                .queryParam("jobId", jobId)
                .build()
                .toUri();
        sendReqToDatamanager(HttpMethod.POST, url, policies, jwt,
                new ParameterizedTypeReference<Void>() {});
    }

    public void updatePolicy(List<PolicyUpdateReqDTO> policies,
                                                                  String databaseName,
                                                                  String jwt) throws NotFoundException, InsufficientPrivilegeForDatabaseException {
        JwtUser jwtUser = jwtService.extractUser(jwt);
        validateRole(jwtUser.getRole(), databaseName);
        Long jobId = jobService.startJob(createJob("update_policies", System.currentTimeMillis()), jwt);
        URI url = UriComponentsBuilder
                .fromUriString(DATA_MANAGER_URL)
                .queryParam("databaseName", databaseName)
                .queryParam("jobId", jobId)
                .build()
                .toUri();
        sendReqToDatamanager(HttpMethod.PUT, url, policies, jwt,
                new ParameterizedTypeReference<Void>() {});
    }

    public void deletePolicy(List<Long> policyIds,
                                                                  String databaseName,
                                                                  String jwt) throws NotFoundException, InsufficientPrivilegeForDatabaseException {
        JwtUser jwtUser = jwtService.extractUser(jwt);
        validateRole(jwtUser.getRole(), databaseName);
        Long jobId = jobService.startJob(createJob("delete_policies", System.currentTimeMillis()), jwt);
        URI url = UriComponentsBuilder.fromUriString(DATA_MANAGER_URL)
                .queryParam("databaseName", databaseName)
                .queryParam("jobId", jobId)
                .build()
                .toUri();
        sendReqToDatamanager(HttpMethod.DELETE, url, policyIds, jwt,
                new ParameterizedTypeReference<Void>() {});
    }
}
