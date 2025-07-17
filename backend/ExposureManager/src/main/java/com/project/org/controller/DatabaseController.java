package com.project.org.controller;

import com.project.org.controller.dto.request.database.DatabaseCreateReqDTO;
import com.project.org.controller.dto.request.database.DatabaseUpdateReqDTO;
import com.project.org.controller.dto.response.DefaultDatabaseResDTO;
import com.project.org.error.exception.NotFoundException;
import com.project.org.service.DatabaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/databases")
public class DatabaseController {
    private final DatabaseService databaseService;

    @Autowired
    public DatabaseController(DatabaseService databaseService) {
        this.databaseService = databaseService;
    }

    @GetMapping(value = "")
    public ResponseEntity<List<DefaultDatabaseResDTO>> getDatabases(@RequestParam(name = "page") int page,
                                                                    @RequestParam(name = "size") int size,
                                                                    @CookieValue("access_token") String jwt) {
        List<DefaultDatabaseResDTO> databaseResDTOs = databaseService.getDatabases(page, size, jwt);
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(databaseResDTOs);
    }


    @PostMapping(value = "")
    public ResponseEntity<Void> createDatabase(@RequestBody List<DatabaseCreateReqDTO> reqDTOs,
                                                                @CookieValue("access_token") String jwt) throws NotFoundException {
        return databaseService.createDatabase(reqDTOs, jwt);
    }

    @DeleteMapping("")
    public ResponseEntity<Void> deleteDatabase(@RequestBody List<String> databaseNames,
                                                 @CookieValue("access_token") String jwt) throws NotFoundException {
        return databaseService.deleteDatabaseById(databaseNames, jwt);
    }

    @PutMapping
    public ResponseEntity<Void> updateDatabase(@RequestBody List<DatabaseUpdateReqDTO> reqDTOs,
                                               @CookieValue("access_token") String jwt) throws NotFoundException {
        return databaseService.updateDatabase(reqDTOs, jwt);
    }
}
