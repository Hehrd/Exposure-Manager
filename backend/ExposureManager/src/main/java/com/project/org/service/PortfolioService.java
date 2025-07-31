package com.project.org.service;

import com.project.org.controller.dto.request.portfolio.PortfolioCreateReqDTO;
import com.project.org.controller.dto.request.portfolio.PortfolioUpdateReqDTO;
import com.project.org.controller.dto.response.DefaultPortfolioResDTO;
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
public class PortfolioService extends DataService {

    @Autowired
    public PortfolioService(RestTemplate restTemplate,
                            JwtService jwtService,
                            UserRepository userRepository, DatabaseRepository databaseRepository, JobService jobService) {
        super(restTemplate,
                jwtService,
                userRepository,
                databaseRepository,
                jobService,
                "http://localhost:19000/portfolios");
    }

    public ResponseEntity<PagedResponse<DefaultPortfolioResDTO>> getPortfolios(int page,
                                                                               int size,
                                                                               String databaseName,
                                                                               String jwt) throws NotFoundException, InsufficientPrivilegeForDatabaseException, ExecutionException, InterruptedException {
        JwtUser jwtUser = jwtService.extractUser(jwt);
        validateRole(jwtUser.getRole(), databaseName);
        URI url = UriComponentsBuilder
                .fromUriString(DATA_MANAGER_URL)
                .queryParam("page", page)
                .queryParam("size", size)
                .queryParam("databaseName", databaseName)
                .build()
                .toUri();
        return sendReqToDatamanager(HttpMethod.GET, url, null, jwt,
                new ParameterizedTypeReference<PagedResponse<DefaultPortfolioResDTO>>() {}).get();
    }

    public void createPortfolios(List<PortfolioCreateReqDTO> portfolios,
                                                                         String databaseName,
                                                                         String jwt) throws NotFoundException, InsufficientPrivilegeForDatabaseException {
        JwtUser jwtUser = jwtService.extractUser(jwt);
        validateRole(jwtUser.getRole(), databaseName);
        Long jobId = jobService.startJob(createJob("create_portfolios", System.currentTimeMillis()), jwt);
        URI url = UriComponentsBuilder.fromUriString(DATA_MANAGER_URL)
                .queryParam("databaseName", databaseName)
                .queryParam("jobId", jobId)
                .build()
                .toUri();
        sendReqToDatamanager(HttpMethod.POST, url, portfolios, jwt,
                new ParameterizedTypeReference<Void>() {});
    }

    public void updatePortfolios(List<PortfolioUpdateReqDTO> portfolios,
                                                                         String databaseName,
                                                                         String jwt) throws NotFoundException, InsufficientPrivilegeForDatabaseException {
        JwtUser jwtUser = jwtService.extractUser(jwt);
        validateRole(jwtUser.getRole(), databaseName);
        Long jobId = jobService.startJob(createJob("update_portfolios", System.currentTimeMillis()), jwt);
        URI url = UriComponentsBuilder
                .fromUriString(DATA_MANAGER_URL)
                .queryParam("databaseName", databaseName)
                .queryParam("jobId", jobId)
                .build()
                .toUri();
        sendReqToDatamanager(HttpMethod.PUT, url, portfolios, jwt,
                new ParameterizedTypeReference<Void>() {});
    }

    public void deletePortfolios(List<Long> portfolioIds, String databaseName, String jwt) throws NotFoundException, InsufficientPrivilegeForDatabaseException {
        JwtUser jwtUser = jwtService.extractUser(jwt);
        validateRole(jwtUser.getRole(), databaseName);
        Long jobId = jobService.startJob(createJob("delete_portfolios", System.currentTimeMillis()), jwt);
        URI url = UriComponentsBuilder
                .fromUriString(DATA_MANAGER_URL)
                .queryParam("databaseName", databaseName)
                .queryParam("jobId", jobId)
                .build()
                .toUri();
        sendReqToDatamanager(HttpMethod.DELETE, url, portfolioIds, jwt,
                new ParameterizedTypeReference<Void>() {});
    }
}


