package com.project.org.controller;

import com.project.org.controller.dto.request.database.DatabaseCreateReqDTO;
import com.project.org.controller.dto.request.database.DatabaseRenameReqDTO;
import com.project.org.error.exception.DatabaseNotFoundException;
import com.project.org.service.DatabaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.sql.SQLException;
import java.util.List;

@RestController
@RequestMapping(value = "/databases")
public class DatabaseController {
    private final DatabaseService databaseService;

    @Autowired
    public DatabaseController(DatabaseService databaseService) {
        this.databaseService = databaseService;
    }


    @PostMapping(value = "")
    public ResponseEntity<Void> createDatabase(@RequestBody List<DatabaseCreateReqDTO> reqDTOs,
                                               @RequestParam("jobId") Long jobId,
                                               @CookieValue("access_token") String jwt) throws SQLException, IOException, DatabaseNotFoundException {
        databaseService.createDatabaseIfNotExists(reqDTOs, jobId, jwt);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .build();
    }

    @DeleteMapping("")
    public ResponseEntity<String> deleteDatabase(@RequestBody List<String> databaseNames,
                                                 @RequestParam("jobId") Long jobId,
                                                 @CookieValue("access_token") String jwt) throws SQLException, IOException, DatabaseNotFoundException {
        databaseService.deleteDatabase(databaseNames, jobId, jwt);
        return ResponseEntity
                .status(HttpStatus.NO_CONTENT)
                .build();
    }

    @PutMapping("")
    public ResponseEntity<String> updateDatabase(@RequestBody List<DatabaseRenameReqDTO> reqDTOs,
                                                 @RequestParam("jobId") Long jobId,
                                                 @CookieValue("access_token") String jwt) throws SQLException, IOException, DatabaseNotFoundException {
        databaseService.renameDatabase(reqDTOs, jobId, jwt);
        return ResponseEntity
                .status(HttpStatus.OK)
                .build();
    }

}
