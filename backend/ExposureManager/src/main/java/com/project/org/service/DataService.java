package com.project.org.service;

import com.project.org.error.exception.NotFoundException;
import com.project.org.persistence.entity.UserEntity;
import com.project.org.persistence.repository.UserRepository;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.Map;
import java.util.Optional;

public abstract class DataService {
    protected final String DATA_MANAGER_URL;

    protected final RestTemplate restTemplate;
    protected final JwtService jwtService;
    protected final UserRepository userRepository;

    public DataService(RestTemplate restTemplate, JwtService jwtService, UserRepository userRepository,
                       String dataManagerURL) {
        this.restTemplate = restTemplate;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.DATA_MANAGER_URL = dataManagerURL;
    }

    protected Long getUserId(String username) throws NotFoundException {
        Optional<UserEntity> userEntityOptional = userRepository.findByUsername(username);
        UserEntity userEntity = userEntityOptional.orElseThrow(() -> new NotFoundException(username));
        return userEntity.getId();
    }

    protected <T, P> ResponseEntity<P> sendReqToDatamanager(HttpMethod httpMethod,
                                                            URI url,
                                                            T payload,
                                                            Long userId,
                                                            ParameterizedTypeReference<P> responseClass) {
        HttpHeaders headers = new HttpHeaders();
        if (userId != null) {
            String userIdCookie = String.format("ownerId=%s", userId);
            headers.add(HttpHeaders.COOKIE, userIdCookie);
        }
        HttpEntity<T> entity = new HttpEntity<>(payload, headers);
        return restTemplate.exchange(url, httpMethod, entity, responseClass);
    }
}
