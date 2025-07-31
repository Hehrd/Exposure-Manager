package com.project.org.service;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.util.concurrent.CompletableFuture;

@Service
public class DataManagerClientService {
    private final RestTemplate restTemplate;

    public DataManagerClientService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
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
}
