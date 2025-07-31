package com.project.org.controller;

import com.project.org.controller.dto.request.portfolio.PortfolioCreateReqDTO;
import com.project.org.controller.dto.request.portfolio.PortfolioUpdateReqDTO;
import com.project.org.controller.dto.response.DefaultPortfolioResDTO;
import com.project.org.controller.dto.response.PagedResponse;
import com.project.org.error.exception.InsufficientPrivilegeForDatabaseException;
import com.project.org.error.exception.NotFoundException;
import com.project.org.service.PortfolioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/portfolios")
public class PortfolioController {
    private final PortfolioService portfolioService;

    @Autowired
    public PortfolioController(PortfolioService portfolioService) {
        this.portfolioService = portfolioService;
    }

    @GetMapping("")
    public ResponseEntity<PagedResponse<DefaultPortfolioResDTO>> getPortfolios(@RequestParam(required = true, name = "page") int page,
                                                                               @RequestParam(required = true, name = "size") int size,
                                                                               @RequestParam(required = true, name = "databaseName") String databaseName,
                                                                               @CookieValue("access_token") String jwt) throws NotFoundException, InsufficientPrivilegeForDatabaseException, ExecutionException, InterruptedException {
        return portfolioService.getPortfolios(page, size, databaseName.toLowerCase(), jwt);
    }

    @PostMapping("")
    public ResponseEntity<Void> createPortfolios(@RequestBody List<PortfolioCreateReqDTO> portfolios,
                                           @RequestParam("databaseName") String databaseName,
                                           @CookieValue("access_token") String jwt) throws NotFoundException, InsufficientPrivilegeForDatabaseException {
        portfolioService.createPortfolios(portfolios, databaseName.toLowerCase(), jwt);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .build();
    }

    @DeleteMapping("")
    public ResponseEntity<Void> deletePortfolios(@RequestBody List<Long> portfolioIds,
                                           @RequestParam("databaseName") String databaseName,
                                           @CookieValue("access_token") String jwt) throws NotFoundException, InsufficientPrivilegeForDatabaseException {
        portfolioService.deletePortfolios(portfolioIds, databaseName, jwt);
        return ResponseEntity
                .status(HttpStatus.NO_CONTENT)
                .build();
    }

    @PutMapping("")
    public ResponseEntity<Void> updatePortfolios(@RequestBody List<PortfolioUpdateReqDTO> portfolios,
                                           @RequestParam("databaseName") String databaseName,
                                           @CookieValue("access_token") String jwt) throws NotFoundException, InsufficientPrivilegeForDatabaseException {
        portfolioService.updatePortfolios(portfolios, databaseName, jwt);
        return ResponseEntity
                .status(HttpStatus.OK)
                .build();
    }
}
