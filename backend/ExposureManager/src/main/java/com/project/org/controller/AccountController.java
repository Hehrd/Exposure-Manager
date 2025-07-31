package com.project.org.controller;

import com.project.org.controller.dto.request.account.AccountCreateReqDTO;
import com.project.org.controller.dto.request.account.AccountUpdateReqDTO;
import com.project.org.controller.dto.response.DefaultAccountResDTO;
import com.project.org.controller.dto.response.PagedResponse;
import com.project.org.error.exception.InsufficientPrivilegeForDatabaseException;
import com.project.org.error.exception.NotFoundException;
import com.project.org.service.AccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/accounts")
public class AccountController {
    private final AccountService accountService;

    @Autowired
    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @GetMapping("")
    public ResponseEntity<PagedResponse<DefaultAccountResDTO>> getAccounts(@RequestParam("page") int page,
                                                     @RequestParam("size") int size,
                                                     @RequestParam("databaseName") String databaseName,
                                                     @RequestParam("portfolioId") Long portfolioId,
                                                     @CookieValue("access_token") String jwt) throws NotFoundException, InsufficientPrivilegeForDatabaseException, ExecutionException, InterruptedException {
        return accountService.getAccounts(page, size, databaseName, portfolioId, jwt);
    }

    @PostMapping("")
    public ResponseEntity<Void> createAccounts(@RequestBody List<AccountCreateReqDTO> accounts,
                                               @RequestParam("databaseName") String databaseName,
                                               @CookieValue("access_token") String jwt) throws NotFoundException, InsufficientPrivilegeForDatabaseException {
        accountService.createAccounts(accounts, databaseName, jwt);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .build();
    }

    @DeleteMapping("")
    public ResponseEntity<Void> deleteAccounts(@RequestBody List<Long> accountIds,
                                               @RequestParam("databaseName") String databaseName,
                                               @CookieValue("access_token") String jwt) throws NotFoundException, InsufficientPrivilegeForDatabaseException {
        accountService.deleteAccounts(accountIds, databaseName, jwt);
        return ResponseEntity
                .status(HttpStatus.NO_CONTENT)
                .build();
    }

    @PutMapping("")
    public ResponseEntity updateAccounts(@RequestBody List<AccountUpdateReqDTO> accounts,
                                         @RequestParam("databaseName") String databaseName,
                                         @CookieValue("access_token") String jwt) throws NotFoundException, InsufficientPrivilegeForDatabaseException {
        accountService.updateAccounts(accounts, databaseName, jwt);
        return ResponseEntity
                .status(HttpStatus.OK)
                .build();
    }
}
