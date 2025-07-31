package com.project.org.controller;

import com.project.org.controller.dto.request.location.LocationCreateReqDTO;
import com.project.org.controller.dto.request.location.LocationUpdateReqDTO;
import com.project.org.controller.dto.response.DefaultLocationResDTO;
import com.project.org.controller.dto.response.PagedResponse;
import com.project.org.error.exception.DatabaseNotFoundException;
import com.project.org.service.LocationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.SQLException;
import java.util.List;

@RestController
@RequestMapping("/locations")
public class LocationController {
    private final LocationService locationService;

    @Autowired
    public LocationController(LocationService locationService) {
        this.locationService = locationService;
    }

    @GetMapping("")
    public ResponseEntity<PagedResponse<DefaultLocationResDTO>> getLocations(@RequestParam("page") int page,
                                                                    @RequestParam("size") int size,
                                                                    @RequestParam("databaseName") String databaseName,
                                                                    @RequestParam("accountId") Long accountId,
                                                                    @CookieValue("access_token") String jwt) throws SQLException, DatabaseNotFoundException {
        PagedResponse<DefaultLocationResDTO> pagedResponse =
                locationService.getLocations(page, size, databaseName, accountId, jwt);
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(pagedResponse);

    }

    @PostMapping("")
    public ResponseEntity<String> createLocation(@RequestBody List<LocationCreateReqDTO> locations,
                                                 @RequestParam("databaseName") String databaseName,
                                                 @RequestParam("jobId") Long jobId,
                                                 @CookieValue("access_token") String jwt) throws SQLException, DatabaseNotFoundException {
        locationService.createLocations(locations, databaseName, jobId, jwt);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .build();
    }

    @DeleteMapping("")
    public ResponseEntity<String> deleteLocation(@RequestBody List<Long> locationIds,
                                                 @RequestParam("databaseName") String databaseName,
                                                 @RequestParam("jobId") Long jobId,
                                                 @CookieValue("access_token") String jwt) throws SQLException, DatabaseNotFoundException {
        locationService.deleteLocations(locationIds, databaseName, jobId, jwt);
        return ResponseEntity
                .status(HttpStatus.NO_CONTENT)
                .build();
    }

    @PutMapping("")
    public ResponseEntity<String> updateAccount(@RequestBody List<LocationUpdateReqDTO> locations,
                                                @RequestParam("databaseName") String databaseName,
                                                @RequestParam("jobId") Long jobId,
                                                @CookieValue("access_token") String jwt) throws SQLException, DatabaseNotFoundException {
        locationService.updateLocations(locations, databaseName, jobId, jwt);
        return ResponseEntity
                .status(HttpStatus.OK)
                .build();
    }
}
