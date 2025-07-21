package com.project.org.controller;

import com.project.org.controller.dto.request.account.AccountCreateReqDTO;
import com.project.org.controller.dto.request.account.AccountUpdateReqDTO;
import com.project.org.controller.dto.response.DefaultAccountResDTO;
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
    public ResponseEntity<List<DefaultAccountResDTO>> getAccounts(@RequestParam("page") int page,
                                                                  @RequestParam("size") int size,
                                                                  @RequestParam("databaseName") String databaseName,
                                                                  @CookieValue("ownerId") Long ownerId) throws SQLException {
       List<DefaultAccountResDTO> accounts = accountService.getAccounts(page, size, databaseName, ownerId);
       return ResponseEntity
               .status(HttpStatus.OK)
               .body(accounts);
    }

    @PostMapping(value = "")
    public ResponseEntity<String> createAccounts(@RequestBody List<AccountCreateReqDTO> accounts,
                                                 @RequestParam("databaseName") String databaseName,
                                                 @CookieValue("ownerId") Long ownerId) throws SQLException {
        accountService.createAccounts(accounts, databaseName, ownerId);
        return ResponseEntity.ok("Success");
    }

    @DeleteMapping("")
    public ResponseEntity<String> deleteAccounts(@RequestBody List<Long> accIds,
                                                @RequestParam("databaseName") String databaseName) throws SQLException {
        accountService.deleteAccount(accIds, databaseName);
        return ResponseEntity
                .status(HttpStatus.NO_CONTENT)
                .build();
    }

    @PutMapping("")
    public ResponseEntity<String> updateAccounts(@RequestBody List<AccountUpdateReqDTO> accounts,
                                                @RequestParam("databaseName") String databaseName) throws SQLException {
        accountService.updateAccount(accounts, databaseName);
        return ResponseEntity
                .status(HttpStatus.OK)
                .build();
    }
}
