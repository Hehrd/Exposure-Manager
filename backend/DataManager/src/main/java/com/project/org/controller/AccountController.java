package com.project.org.controller;

import com.project.org.controller.dto.request.account.AccountCreateReqDTO;
import com.project.org.controller.dto.request.account.AccountUpdateReqDTO;
import com.project.org.controller.dto.response.DefaultAccountResDTO;
import com.project.org.controller.dto.response.PagedResponse;
import com.project.org.error.exception.DatabaseNotFoundException;
import com.project.org.service.AccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.SQLException;
import java.util.List;

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
                                                                  @CookieValue("access_token") String jwt) throws SQLException, DatabaseNotFoundException {
       PagedResponse<DefaultAccountResDTO> accounts = accountService.getAccounts(page, size, databaseName, portfolioId, jwt);
       return ResponseEntity
               .status(HttpStatus.OK)
               .body(accounts);
    }

    @PostMapping(value = "")
    public ResponseEntity<String> createAccounts(@RequestBody List<AccountCreateReqDTO> accounts,
                                                 @RequestParam("databaseName") String databaseName,
                                                 @RequestParam("jobId") Long jobId,
                                                 @CookieValue("access_token") String jwt) throws SQLException, DatabaseNotFoundException {
        accountService.createAccounts(accounts, databaseName, jobId, jwt);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .build();
    }

    @DeleteMapping("")
    public ResponseEntity<String> deleteAccounts(@RequestBody List<Long> accIds,
                                                 @RequestParam("jobId") Long jobId,
                                                @RequestParam("databaseName") String databaseName,
                                                 @CookieValue("access_token") String jwt) throws SQLException, DatabaseNotFoundException {
        accountService.deleteAccount(accIds, databaseName, jobId, jwt);
        return ResponseEntity
                .status(HttpStatus.NO_CONTENT)
                .build();
    }

    @PutMapping("")
    public ResponseEntity<String> updateAccounts(@RequestBody List<AccountUpdateReqDTO> accounts,
                                                 @RequestParam("jobId") Long jobId,
                                                @RequestParam("databaseName") String databaseName,
                                                 @CookieValue("access_token") String jwt) throws SQLException, DatabaseNotFoundException {
        accountService.updateAccount(accounts, databaseName, jobId, jwt);
        return ResponseEntity
                .status(HttpStatus.OK)
                .build();
    }
}
