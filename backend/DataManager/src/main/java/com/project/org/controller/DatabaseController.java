package com.project.org.controller;

import com.project.org.controller.dto.request.database.DatabaseCreateReqDTO;
import com.project.org.controller.dto.request.database.DatabaseRenameReqDTO;
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
    public ResponseEntity<Void> createDatabase(@RequestBody List<DatabaseCreateReqDTO> reqDTOs) throws SQLException, IOException {
        databaseService.createDatabaseIfNotExists(reqDTOs);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .build();
    }

    @DeleteMapping("")
    public ResponseEntity<String> deleteDatabase(@RequestBody List<String> databaseNames) throws SQLException, IOException {
        databaseService.deleteDatabase(databaseNames);
        return ResponseEntity
                .status(HttpStatus.NO_CONTENT)
                .build();
    }

    @PutMapping("")
    public ResponseEntity<String> updateDatabase(@RequestBody List<DatabaseRenameReqDTO> reqDTOs) throws SQLException, IOException {
        databaseService.renameDatabase(reqDTOs);
        return ResponseEntity
                .status(HttpStatus.OK)
                .build();
    }

}
