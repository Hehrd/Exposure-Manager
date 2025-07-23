package com.project.org.controller;

import com.project.org.controller.dto.request.location.LocationCreateReqDTO;
import com.project.org.controller.dto.request.location.LocationUpdateReqDTO;
import com.project.org.controller.dto.response.DefaultLocationResDTO;
import com.project.org.controller.dto.response.PagedResponse;
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
                                                                    @CookieValue("ownerId") Long ownerId) throws SQLException {
        PagedResponse<DefaultLocationResDTO> pagedResponse =
                locationService.getLocations(page, size, databaseName, accountId, ownerId);
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(pagedResponse);

    }

    @PostMapping("")
    public ResponseEntity<String> createLocation(@RequestBody List<LocationCreateReqDTO> locations,
                                                 @RequestParam("databaseName") String databaseName,
                                                 @CookieValue("ownerId") Long ownerId) throws SQLException {
        locationService.createLocations(locations, databaseName, ownerId);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .build();
    }

    @DeleteMapping("")
    public ResponseEntity<String> deleteLocation(@RequestBody List<Long> locationIds,
                                                 @RequestParam("databaseName") String databaseName,
                                                 @CookieValue("ownerId") Long ownerId) throws SQLException {
        locationService.deleteLocations(locationIds, databaseName, ownerId);
        return ResponseEntity
                .status(HttpStatus.NO_CONTENT)
                .build();
    }

    @PutMapping("")
    public ResponseEntity<String> updateAccount(@RequestBody List<LocationUpdateReqDTO> locations,
                                                @RequestParam("databaseName") String databaseName,
                                                @CookieValue("ownerId") Long ownerId) throws SQLException {
        locationService.updateLocations(locations, databaseName, ownerId);
        return ResponseEntity
                .status(HttpStatus.OK)
                .build();
    }
}
