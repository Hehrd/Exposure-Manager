package com.project.org.controller;

import com.project.org.controller.dto.request.policy.PolicyCreateReqDTO;
import com.project.org.controller.dto.request.policy.PolicyUpdateReqDTO;
import com.project.org.controller.dto.response.DefaultPolicyResDTO;
import com.project.org.controller.dto.response.PagedResponse;
import com.project.org.error.exception.InsufficientPrivilegeForDatabaseException;
import com.project.org.error.exception.NotFoundException;
import com.project.org.service.PolicyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.ExecutionException;

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
                                                                          @CookieValue("access_token") String jwt) throws NotFoundException, InsufficientPrivilegeForDatabaseException, ExecutionException, InterruptedException {
        return policyService.getPolicies(page, size, databaseName, accountId, jwt);
    }

    @PostMapping("")
    public ResponseEntity<Void> createPolicies(@RequestBody List<PolicyCreateReqDTO> policies,
                                         @RequestParam("databaseName") String databaseName,
                                         @CookieValue("access_token") String jwt) throws NotFoundException, InsufficientPrivilegeForDatabaseException {
        policyService.createPolicy(policies, databaseName, jwt);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .build();
    }

    @DeleteMapping("")
    public ResponseEntity<Void> deletePolicies(@RequestBody List<Long> policyIds,
                                         @RequestParam("databaseName") String databaseName,
                                         @CookieValue("access_token") String jwt) throws NotFoundException, InsufficientPrivilegeForDatabaseException {
        policyService.deletePolicy(policyIds, databaseName, jwt);
        return ResponseEntity
                .status(HttpStatus.NO_CONTENT)
                .build();
    }

    @PutMapping("")
    public ResponseEntity<Void> updatePolicies(@RequestBody List<PolicyUpdateReqDTO> policies,
                                         @RequestParam("databaseName") String databaseName,
                                         @CookieValue("access_token") String jwt) throws NotFoundException, InsufficientPrivilegeForDatabaseException {
        policyService.updatePolicy(policies, databaseName, jwt);
        return ResponseEntity
                .status(HttpStatus.OK)
                .build();
    }
}
