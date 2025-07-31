package com.project.org.service;

import com.project.org.controller.dto.request.account.AccountCreateReqDTO;
import com.project.org.controller.dto.request.account.AccountUpdateReqDTO;
import com.project.org.controller.dto.request.job.JobCreateReqDTO;
import com.project.org.controller.dto.response.DefaultAccountResDTO;
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
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

@Service
public class AccountService extends DataService{

    @Autowired
    public AccountService(RestTemplate restTemplate,
                          JwtService jwtService,
                          UserRepository userRepository,
                          DatabaseRepository databaseRepository,
                          JobService jobService,
                          DataManagerClientService dataManagerClientService) {
        super(restTemplate, jwtService, userRepository, databaseRepository, jobService, dataManagerClientService,
                "http://localhost:19000/accounts");
    }

    public ResponseEntity<PagedResponse<DefaultAccountResDTO>> getAccounts(int page,
                                                                  int size,
                                                                  String databaseName,
                                                                  Long portfolioId,
                                                                  String jwt) throws NotFoundException, InsufficientPrivilegeForDatabaseException, ExecutionException, InterruptedException {
        JwtUser jwtUser = jwtService.extractUser(jwt);
        validateRole(jwtUser.getRole(), databaseName);
        URI url = UriComponentsBuilder.fromUriString(DATA_MANAGER_URL)
                .queryParam("page", page)
                .queryParam("size", size)
                .queryParam("databaseName", databaseName)
                .queryParam("portfolioId", portfolioId)
                .build()
                .toUri();
        CompletableFuture<ResponseEntity<PagedResponse<DefaultAccountResDTO>>> future =
                dataManagerClientService.sendReqToDatamanager(HttpMethod.GET, url, null, jwt,
                new ParameterizedTypeReference<PagedResponse<DefaultAccountResDTO>>() {});
        return future.get();
    }

    public void createAccounts(List<AccountCreateReqDTO> accounts,
                                               String databaseName,
                                               String jwt) throws NotFoundException, InsufficientPrivilegeForDatabaseException {
        JwtUser jwtUser = jwtService.extractUser(jwt);
        validateRole(jwtUser.getRole(), databaseName);
        Long jobId = jobService.startJob(createJob("create_accounts", System.currentTimeMillis()), jwt);
        URI url = UriComponentsBuilder
                .fromUriString(DATA_MANAGER_URL)
                .queryParam("databaseName", databaseName)
                .queryParam("jobId", jobId)
                .build()
                .toUri();
        dataManagerClientService.sendReqToDatamanager(HttpMethod.POST, url, accounts, jwt,
                new ParameterizedTypeReference<Void>() {});
    }

    public void updateAccounts(List<AccountUpdateReqDTO> accounts,
                                               String databaseName,
                                               String jwt) throws NotFoundException, InsufficientPrivilegeForDatabaseException {
        JwtUser jwtUser = jwtService.extractUser(jwt);
        validateRole(jwtUser.getRole(), databaseName);
        Long jobId = jobService.startJob(createJob("update_accounts", System.currentTimeMillis()), jwt);
        URI url = UriComponentsBuilder.fromUriString(DATA_MANAGER_URL)
                .queryParam("databaseName", databaseName)
                .queryParam("jobId", jobId)
                .build()
                .toUri();
        dataManagerClientService.sendReqToDatamanager(HttpMethod.PUT, url, accounts, jwt,
                new ParameterizedTypeReference<Void>() {});
    }

    public void deleteAccounts(List<Long> accountIds,
                                               String databaseName,
                                               String jwt) throws NotFoundException, InsufficientPrivilegeForDatabaseException {
        JwtUser jwtUser = jwtService.extractUser(jwt);
        validateRole(jwtUser.getRole(), databaseName);
        Long jobId = jobService.startJob(createJob("delete_accounts", System.currentTimeMillis()), jwt);
        URI url = UriComponentsBuilder.fromUriString(DATA_MANAGER_URL)
                .queryParam("databaseName", databaseName)
                .queryParam("jobId", jobId)
                .build()
                .toUri();
        dataManagerClientService.sendReqToDatamanager(HttpMethod.DELETE, url, accountIds, jwt,
                new ParameterizedTypeReference<Void>() {});
    }


}
