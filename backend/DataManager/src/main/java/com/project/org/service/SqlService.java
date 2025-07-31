package com.project.org.service;

import com.project.org.controller.dto.request.job.JobStatus;
import com.project.org.controller.dto.request.job.JobUpdateReqDTO;
import com.project.org.error.exception.DatabaseNotFoundException;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.sql.*;
import java.util.HashMap;
import java.util.Map;

public abstract class SqlService {
    private final String EXPOSURE_MANAGER_URL;

    protected final String DEFAULT_DATABASE_URL;
    protected final String DEFAULT_DATABASE_USER;
    protected final String DEFAULT_DATABASE_PASSWORD;

    protected final RestTemplate restTemplate;

    protected final JwtService jwtService;

    protected SqlService(String dbUrl,
                         String user,
                         String password,
                         RestTemplate restTemplate,
                         JwtService jwtService) {
        this.EXPOSURE_MANAGER_URL = "http://localhost:6969";
        this.DEFAULT_DATABASE_URL = dbUrl;
        this.DEFAULT_DATABASE_USER = user;
        this.DEFAULT_DATABASE_PASSWORD = password;
        this.restTemplate = restTemplate;
        this.jwtService = jwtService;
    }

    protected Connection createConnection(String databaseName) throws SQLException {
        String url = String.format("jdbc:postgresql://localhost:5432/%s", databaseName);
        return DriverManager.getConnection(url,
                DEFAULT_DATABASE_USER,
                DEFAULT_DATABASE_PASSWORD);
    }

    protected void verifyDatabase(String databaseName, boolean existsExpected) throws SQLException, DatabaseNotFoundException {
        Connection connection = createConnection("postgres");
        String checkSql = "SELECT 1 FROM pg_database WHERE datname = ?";
        PreparedStatement checkStatement = connection.prepareStatement(checkSql);
        checkStatement.setString(1, databaseName);
        ResultSet rs = checkStatement.executeQuery();
        boolean exists = rs.next();
        checkStatement.close();
        if (exists != existsExpected) {
            String msg = String.format("Database %s does not exist", databaseName);
            throw new DatabaseNotFoundException(msg);
        }
    }

    protected void finishJob(Long jobId, String jwt) {
        JobUpdateReqDTO jobUpdateReqDTO = new JobUpdateReqDTO(jobId, System.currentTimeMillis(), JobStatus.FINISHED);
        String url = String.format("%s/jobs", EXPOSURE_MANAGER_URL);
        String jwtCookie = String.format("access_token=%s", jwt);
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.COOKIE, jwtCookie);
        HttpEntity<JobUpdateReqDTO> entity = new HttpEntity<>(jobUpdateReqDTO, headers);
        restTemplate.exchange(url, HttpMethod.POST, entity, Void.class);
    }




}
