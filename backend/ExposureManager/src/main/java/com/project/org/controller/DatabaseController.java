package com.project.org.controller;

import com.project.org.controller.dto.request.database.DatabaseCreateReqDTO;
import com.project.org.controller.dto.request.database.DatabaseUpdateReqDTO;
import com.project.org.controller.dto.response.DefaultDatabaseResDTO;
import com.project.org.controller.dto.response.PagedResponse;
import com.project.org.error.exception.InsufficientPrivilegeForDatabaseException;
import com.project.org.error.exception.NotFoundException;
import com.project.org.service.DatabaseService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/databases")
@Validated
public class DatabaseController {
    private final DatabaseService databaseService;

    @Autowired
    public DatabaseController(DatabaseService databaseService) {
        this.databaseService = databaseService;
    }

    @GetMapping(value = "")
    public ResponseEntity<PagedResponse<DefaultDatabaseResDTO>> getDatabases(
            @RequestParam(name = "page") @NotNull Integer page,
            @RequestParam(name = "size") @NotNull Integer size,
            @CookieValue("access_token") @NotBlank String jwt)
            throws NotFoundException {

        PagedResponse<DefaultDatabaseResDTO> databaseResDTOs = databaseService.getDatabases(page, size, jwt);
        return ResponseEntity.status(HttpStatus.OK).body(databaseResDTOs);
    }

    @PostMapping(value = "")
    public ResponseEntity<Void> createDatabase(
            @Valid @RequestBody List<@Valid DatabaseCreateReqDTO> reqDTOs,
            @CookieValue("access_token") @NotBlank String jwt)
            throws NotFoundException {

        databaseService.createDatabase(reqDTOs, jwt);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("")
    public ResponseEntity<Void> deleteDatabase(
            @RequestBody List<@NotBlank String> databaseNames,
            @CookieValue("access_token") @NotBlank String jwt)
            throws NotFoundException, InsufficientPrivilegeForDatabaseException {

        databaseService.deleteDatabases(databaseNames, jwt);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @PutMapping("")
    public ResponseEntity<Void> updateDatabase(
            @Valid @RequestBody List<@Valid DatabaseUpdateReqDTO> reqDTOs,
            @CookieValue("access_token") @NotBlank String jwt)
            throws NotFoundException, InsufficientPrivilegeForDatabaseException {

        databaseService.updateDatabase(reqDTOs, jwt);
        return ResponseEntity.status(HttpStatus.OK).build();
    }
}
