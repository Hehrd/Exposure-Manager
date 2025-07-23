package com.project.org.service;

import com.project.org.controller.dto.request.portfolio.PortfolioCreateReqDTO;
import com.project.org.controller.dto.request.portfolio.PortfolioUpdateReqDTO;
import com.project.org.controller.dto.response.DefaultPortfolioResDTO;
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
public class PortfolioService extends DataService {

    @Autowired
    public PortfolioService(RestTemplate restTemplate,
                            JwtService jwtService,
                            UserRepository userRepository) {
        super(restTemplate,
                jwtService,
                userRepository,
                "http://localhost:19000/portfolios");
    }

    public ResponseEntity<PagedResponse<DefaultPortfolioResDTO>> getPortfolios(int page,
                                                                               int size,
                                                                               String databaseName,
                                                                               String jwt) throws NotFoundException {
        String username = jwtService.extractUsername(jwt);
        Long userId = getUserId(username);
        URI url = UriComponentsBuilder
                .fromUriString(DATA_MANAGER_URL)
                .queryParam("page", page)
                .queryParam("size", size)
                .queryParam("databaseName", databaseName)
                .build()
                .toUri();
        return sendReqToDatamanager(HttpMethod.GET, url, null, userId,
                new ParameterizedTypeReference<PagedResponse<DefaultPortfolioResDTO>>() {});
    }

    public ResponseEntity<Void> createPortfolios(List<PortfolioCreateReqDTO> portfolios,
                                                                         String databaseName,
                                                                         String jwt) throws NotFoundException {
        String username = jwtService.extractUsername(jwt);
        Long userId = getUserId(username);
        URI url = UriComponentsBuilder.fromUriString(DATA_MANAGER_URL)
                .queryParam("databaseName", databaseName)
                .build()
                .toUri();
        return sendReqToDatamanager(HttpMethod.POST, url, portfolios, userId,
                new ParameterizedTypeReference<Void>() {});
    }

    public ResponseEntity<Void> updatePortfolios(List<PortfolioUpdateReqDTO> portfolios,
                                                                         String databaseName,
                                                                         String jwt) throws NotFoundException {
        String username = jwtService.extractUsername(jwt);
        Long userId = getUserId(username);
        URI url = UriComponentsBuilder
                .fromUriString(DATA_MANAGER_URL)
                .queryParam("databaseName", databaseName)
                .build()
                .toUri();
        return sendReqToDatamanager(HttpMethod.PUT, url, portfolios, null,
                new ParameterizedTypeReference<Void>() {});
    }

    public ResponseEntity<Void> deletePortfolios(List<Long> portfolioIds, String databaseName, String jwt) throws NotFoundException {
        String username = jwtService.extractUsername(jwt);
        Long userId = getUserId(username);
        URI url = UriComponentsBuilder
                .fromUriString(DATA_MANAGER_URL)
                .queryParam("databaseName", databaseName)
                .build()
                .toUri();
        return sendReqToDatamanager(HttpMethod.DELETE, url, portfolioIds, userId,
                new ParameterizedTypeReference<Void>() {});
    }
}


