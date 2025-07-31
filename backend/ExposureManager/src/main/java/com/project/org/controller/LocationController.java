package com.project.org.controller;

import com.project.org.controller.dto.request.location.LocationCreateReqDTO;
import com.project.org.controller.dto.request.location.LocationUpdateReqDTO;
import com.project.org.controller.dto.response.DefaultLocationResDTO;
import com.project.org.controller.dto.response.PagedResponse;
import com.project.org.error.exception.InsufficientPrivilegeForDatabaseException;
import com.project.org.error.exception.NotFoundException;
import com.project.org.service.LocationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.ExecutionException;

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
                                                                             @CookieValue("access_token") String jwt) throws NotFoundException, InsufficientPrivilegeForDatabaseException, ExecutionException, InterruptedException {
        return locationService.getLocations(page, size, databaseName, accountId, jwt);
    }

    @PostMapping("")
    public ResponseEntity<Void> createLocations(@RequestBody List<LocationCreateReqDTO> locations,
                                          @RequestParam("databaseName") String databaseName,
                                          @CookieValue("access_token") String jwt) throws NotFoundException, InsufficientPrivilegeForDatabaseException {

        locationService.createLocations(locations, databaseName, jwt);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .build();
    }

    @DeleteMapping("")
    public ResponseEntity<Void> deleteLocations(@RequestBody List<Long> portfolioIds,
                                          @RequestParam("databaseName") String databaseName,
                                          @CookieValue("access_token") String jwt) throws NotFoundException, InsufficientPrivilegeForDatabaseException {
        locationService.deleteLocation(portfolioIds, databaseName, jwt);
        return ResponseEntity
                .status(HttpStatus.NO_CONTENT)
                .build();
    }

    @PutMapping("")
    public ResponseEntity<Void> updateLocations(@RequestBody List<LocationUpdateReqDTO> locations,
                                          @RequestParam("databaseName") String databaseName,
                                          @CookieValue("access_token") String jwt) throws NotFoundException, InsufficientPrivilegeForDatabaseException {
        locationService.updateLocation(locations, databaseName, jwt);
        return ResponseEntity
                .status(HttpStatus.OK)
                .build();
    }
}
