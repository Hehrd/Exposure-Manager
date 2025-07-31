package com.project.org.controller;

import com.project.org.controller.dto.request.policy.PolicyCreateReqDTO;
import com.project.org.controller.dto.request.policy.PolicyUpdateReqDTO;
import com.project.org.controller.dto.response.DefaultPolicyResDTO;
import com.project.org.controller.dto.response.PagedResponse;
import com.project.org.error.exception.InsufficientPrivilegeForDatabaseException;
import com.project.org.error.exception.NotFoundException;
import com.project.org.service.PolicyService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/policies")
@Validated
public class PolicyController {
    private final PolicyService policyService;

    @Autowired
    public PolicyController(PolicyService policyService) {
        this.policyService = policyService;
    }

    @GetMapping("")
    public ResponseEntity<PagedResponse<DefaultPolicyResDTO>> getPolicies(
            @RequestParam("page") @NotNull Integer page,
            @RequestParam("size") @NotNull Integer size,
            @RequestParam("databaseName") @NotBlank String databaseName,
            @RequestParam("accountId") @NotNull Long accountId,
            @CookieValue("access_token") @NotBlank String jwt)
            throws NotFoundException, InsufficientPrivilegeForDatabaseException, ExecutionException, InterruptedException {

        return policyService.getPolicies(page, size, databaseName, accountId, jwt);
    }

    @PostMapping("")
    public ResponseEntity<Void> createPolicies(
            @Valid @RequestBody List<@Valid PolicyCreateReqDTO> policies,
            @RequestParam("databaseName") @NotBlank String databaseName,
            @CookieValue("access_token") @NotBlank String jwt)
            throws NotFoundException, InsufficientPrivilegeForDatabaseException {

        policyService.createPolicy(policies, databaseName, jwt);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("")
    public ResponseEntity<Void> deletePolicies(
            @RequestBody List<@NotNull Long> policyIds,
            @RequestParam("databaseName") @NotBlank String databaseName,
            @CookieValue("access_token") @NotBlank String jwt)
            throws NotFoundException, InsufficientPrivilegeForDatabaseException {

        policyService.deletePolicy(policyIds, databaseName, jwt);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @PutMapping("")
    public ResponseEntity<Void> updatePolicies(
            @Valid @RequestBody List<@Valid PolicyUpdateReqDTO> policies,
            @RequestParam("databaseName") @NotBlank String databaseName,
            @CookieValue("access_token") @NotBlank String jwt)
            throws NotFoundException, InsufficientPrivilegeForDatabaseException {

        policyService.updatePolicy(policies, databaseName, jwt);
        return ResponseEntity.status(HttpStatus.OK).build();
    }
}
