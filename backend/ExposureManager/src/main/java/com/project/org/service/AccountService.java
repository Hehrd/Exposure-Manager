package com.project.org.service;

import com.project.org.controller.dto.request.account.AccountCreateReqDTO;
import com.project.org.controller.dto.request.account.AccountUpdateReqDTO;
import com.project.org.controller.dto.response.DefaultAccountResDTO;
import com.project.org.controller.dto.response.PagedResponse;
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
public class AccountService extends DataService{
    @Autowired
    public AccountService(RestTemplate restTemplate,
                          JwtService jwtService,
                          UserRepository userRepository) {
        super(restTemplate, jwtService, userRepository, "http://localhost:19000/accounts");
    }

    public ResponseEntity<PagedResponse<DefaultAccountResDTO>> getAccounts(int page,
                                                                  int size,
                                                                  String databaseName,
                                                                  Long portfolioId,
                                                                  String jwt) throws NotFoundException {
        String username = jwtService.extractUsername(jwt);
        Long userId = getUserId(username);
        URI url = UriComponentsBuilder.fromUriString(DATA_MANAGER_URL)
                .queryParam("page", page)
                .queryParam("size", size)
                .queryParam("databaseName", databaseName)
                .queryParam("portfolioId", portfolioId)
                .build()
                .toUri();
        return sendReqToDatamanager(HttpMethod.GET, url, null, userId,
                new ParameterizedTypeReference<PagedResponse<DefaultAccountResDTO>>() {});
    }

    public ResponseEntity<Void> createAccounts(List<AccountCreateReqDTO> accounts,
                                               String databaseName,
                                               String jwt) throws NotFoundException {
        String username = jwtService.extractUsername(jwt);
        Long userId = getUserId(username);
        URI url = UriComponentsBuilder
                .fromUriString(DATA_MANAGER_URL)
                .queryParam("databaseName", databaseName)
                .build()
                .toUri();
        return sendReqToDatamanager(HttpMethod.POST, url, accounts, userId,
                new ParameterizedTypeReference<Void>() {});
    }

    public ResponseEntity<Void> updateAccounts(List<AccountUpdateReqDTO> accounts,
                                               String databaseName,
                                               String jwt) throws NotFoundException {
        String username = jwtService.extractUsername(jwt);
        Long userId = getUserId(username);
        URI url = UriComponentsBuilder.fromUriString(DATA_MANAGER_URL)
                .queryParam("databaseName", databaseName)
                .build()
                .toUri();
        return sendReqToDatamanager(HttpMethod.PUT, url, accounts, userId,
                new ParameterizedTypeReference<Void>() {});
    }

    public ResponseEntity<Void> deleteAccounts(List<Long> accountIds,
                                               String databaseName,
                                               String jwt) throws NotFoundException {
        String username = jwtService.extractUsername(jwt);
        Long userId = getUserId(username);
        URI url = UriComponentsBuilder.fromUriString(DATA_MANAGER_URL)
                .queryParam("databaseName", databaseName)
                .build()
                .toUri();
        return sendReqToDatamanager(HttpMethod.DELETE, url, accountIds, userId,
                new ParameterizedTypeReference<Void>() {});
    }
}
