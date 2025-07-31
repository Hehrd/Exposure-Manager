package com.project.org.controller;

import com.project.org.controller.dto.request.portfolio.PortfolioCreateReqDTO;
import com.project.org.controller.dto.request.portfolio.PortfolioUpdateReqDTO;
import com.project.org.controller.dto.response.DefaultPortfolioResDTO;
import com.project.org.controller.dto.response.PagedResponse;
import com.project.org.error.exception.InsufficientPrivilegeForDatabaseException;
import com.project.org.error.exception.NotFoundException;
import com.project.org.service.PortfolioService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/portfolios")
@Validated
public class PortfolioController {
    private final PortfolioService portfolioService;

    @Autowired
    public PortfolioController(PortfolioService portfolioService) {
        this.portfolioService = portfolioService;
    }

    @GetMapping("")
    public ResponseEntity<PagedResponse<DefaultPortfolioResDTO>> getPortfolios(
            @RequestParam("page") @NotNull Integer page,
            @RequestParam("size") @NotNull Integer size,
            @RequestParam("databaseName") @NotBlank String databaseName,
            @CookieValue("access_token") @NotBlank String jwt)
            throws NotFoundException, InsufficientPrivilegeForDatabaseException, ExecutionException, InterruptedException {

        return portfolioService.getPortfolios(page, size, databaseName.toLowerCase(), jwt);
    }

    @PostMapping("")
    public ResponseEntity<Void> createPortfolios(
            @Valid @RequestBody List<@Valid PortfolioCreateReqDTO> portfolios,
            @RequestParam("databaseName") @NotBlank String databaseName,
            @CookieValue("access_token") @NotBlank String jwt)
            throws NotFoundException, InsufficientPrivilegeForDatabaseException {

        portfolioService.createPortfolios(portfolios, databaseName.toLowerCase(), jwt);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("")
    public ResponseEntity<Void> deletePortfolios(
            @RequestBody List<@NotNull Long> portfolioIds,
            @RequestParam("databaseName") @NotBlank String databaseName,
            @CookieValue("access_token") @NotBlank String jwt)
            throws NotFoundException, InsufficientPrivilegeForDatabaseException {

        portfolioService.deletePortfolios(portfolioIds, databaseName, jwt);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @PutMapping("")
    public ResponseEntity<Void> updatePortfolios(
            @Valid @RequestBody List<@Valid PortfolioUpdateReqDTO> portfolios,
            @RequestParam("databaseName") @NotBlank String databaseName,
            @CookieValue("access_token") @NotBlank String jwt)
            throws NotFoundException, InsufficientPrivilegeForDatabaseException {

        portfolioService.updatePortfolios(portfolios, databaseName, jwt);
        return ResponseEntity.status(HttpStatus.OK).build();
    }
}
