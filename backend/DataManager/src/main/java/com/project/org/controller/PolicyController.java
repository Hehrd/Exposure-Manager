package com.project.org.controller;

import com.project.org.controller.dto.request.policy.PolicyCreateReqDTO;
import com.project.org.controller.dto.request.policy.PolicyDeleteReqDTO;
import com.project.org.controller.dto.request.policy.PolicyUpdateReqDTO;
import com.project.org.controller.dto.response.DefaultPolicyResDTO;
import com.project.org.controller.dto.response.PagedResponse;
import com.project.org.error.exception.DatabaseNotFoundException;
import com.project.org.service.PolicyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.SQLException;
import java.util.List;

@RestController
@RequestMapping("/policies")
public class PolicyController {
    private final PolicyService policyService;

    @Autowired
    public PolicyController(PolicyService policyService) {
        this.policyService = policyService;
    }

    @GetMapping("")
    public ResponseEntity<PagedResponse<DefaultPolicyResDTO>> getPolicies(@RequestParam("page") int page,
                                                                          @RequestParam("size") int size,
                                                                          @RequestParam("databaseName") String databaseName,
                                                                          @RequestParam("accountId") Long accountId,
                                                                          @CookieValue("access_token") String jwt) throws SQLException, DatabaseNotFoundException {
        PagedResponse<DefaultPolicyResDTO> policies =
                policyService.getPolicies(page, size, databaseName, accountId, jwt);
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(policies);
    }

    @PostMapping("")
    public ResponseEntity<Void> createPolicy(@RequestBody List<PolicyCreateReqDTO> policies,
                                             @RequestParam("databaseName") String databaseName,
                                             @RequestParam("jobId") Long jobId,
                                             @CookieValue("access_token") String jwt) throws SQLException, DatabaseNotFoundException {
        policyService.createPolicy(policies, databaseName, jobId, jwt);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .build();
    }

    @DeleteMapping("")
    public ResponseEntity<Void> deletePolicy(@RequestBody List<Long> policyIds,
                                             @RequestParam("databaseName") String databaseName,
                                             @RequestParam("jobId") Long jobId,
                                             @CookieValue("access_token") String jwt) throws SQLException, DatabaseNotFoundException {
        policyService.deletePolicy(policyIds, databaseName, jobId, jwt);
        return ResponseEntity
                .status(HttpStatus.NO_CONTENT)
                .build();
    }

    @PutMapping("")
    public ResponseEntity<Void> updatePolicy(@RequestBody List<PolicyUpdateReqDTO> policies,
                                             @RequestParam("databaseName") String databaseName,
                                             @RequestParam("jobId") Long jobId,
                                             @CookieValue("access_token") String jwt) throws SQLException, DatabaseNotFoundException {
        policyService.updatePolicy(policies, databaseName, jobId, jwt);
        return ResponseEntity
                .status(HttpStatus.OK)
                .build();
    }
}
