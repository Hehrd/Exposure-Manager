package com.project.org.service;

import com.project.org.controller.dto.request.job.JobCreateReqDTO;
import com.project.org.error.exception.InsufficientPrivilegeForDatabaseException;
import com.project.org.error.exception.NotFoundException;
import com.project.org.persistence.entity.DatabaseEntity;
import com.project.org.persistence.entity.UserEntity;
import com.project.org.persistence.entity.enums.Role;
import com.project.org.persistence.repository.DatabaseRepository;
import com.project.org.persistence.repository.JobRepository;
import com.project.org.persistence.repository.UserRepository;
import com.project.org.security.JwtUser;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

public abstract class DataService {
    protected final String DATA_MANAGER_URL;

    protected final RestTemplate restTemplate;
    protected final JwtService jwtService;
    protected final UserRepository userRepository;
    protected final DatabaseRepository databaseRepository;
    protected final JobService jobService;

    public DataService(RestTemplate restTemplate, JwtService jwtService,
                       UserRepository userRepository,
                       DatabaseRepository databaseRepository,
                       JobService jobService,
                       String dataManagerURL) {
        this.restTemplate = restTemplate;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.databaseRepository = databaseRepository;
        this.jobService = jobService;
        this.DATA_MANAGER_URL = dataManagerURL;
    }

    protected UserEntity getUserEntity(String jwt) throws NotFoundException {
        JwtUser jwtUser = jwtService.extractUser(jwt);
        Optional<UserEntity> userEntityOptional = userRepository.findById(jwtUser.getId());
        UserEntity userEntity = userEntityOptional
                .orElseThrow(() -> new NotFoundException(String.format("User %s not found", jwtUser.getUsername())));
        return userEntity;
    }

    @Async
    protected <T, P> CompletableFuture<ResponseEntity<P>> sendReqToDatamanager(HttpMethod httpMethod,
                                                                               URI url,
                                                                               T payload,
                                                                               String jwt,
                                                                               ParameterizedTypeReference<P> responseClass) {
        try {
            HttpHeaders headers = new HttpHeaders();
            String userIdCookie = String.format("access_token=%s", jwt);
            headers.add(HttpHeaders.COOKIE, userIdCookie);
            HttpEntity<T> entity = new HttpEntity<>(payload, headers);
            ResponseEntity<P> res = restTemplate.exchange(url, httpMethod, entity, responseClass);
            return CompletableFuture.completedFuture(res);
        } catch (Exception e) {
            return CompletableFuture.failedFuture(e);
        }

    }

    protected void validateRole(Role role, String databaseName) throws InsufficientPrivilegeForDatabaseException, NotFoundException {
        DatabaseEntity databaseEntity = databaseRepository.findByName(databaseName)
                .orElseThrow(() -> new NotFoundException(String.format("Database %s not found!", databaseName)));
        if (!databaseEntity.getAllowedRoles().contains(role)) {
            String message = String.format("Role %s is not allowed to access database", role);
            throw new InsufficientPrivilegeForDatabaseException(message);
        }
    }

    protected JobCreateReqDTO createJob(String name, Long timeStartedMillis) {
        JobCreateReqDTO job = new JobCreateReqDTO();
        job.setName(String.format("%s-%s", name, UUID.randomUUID().toString()));
        job.setTimeStartedMillis(timeStartedMillis);
        return job;
    }

}
