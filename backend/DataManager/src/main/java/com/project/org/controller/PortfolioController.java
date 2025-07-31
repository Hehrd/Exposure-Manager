package com.project.org.controller;

import com.project.org.controller.dto.request.portfolio.PortfolioCreateReqDTO;
import com.project.org.controller.dto.request.portfolio.PortfolioDeleteReqDTO;
import com.project.org.controller.dto.request.portfolio.PortfolioUpdateReqDTO;
import com.project.org.controller.dto.response.DefaultPortfolioResDTO;
import com.project.org.controller.dto.response.PagedResponse;
import com.project.org.error.exception.DatabaseNotFoundException;
import com.project.org.service.PortfolioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.SQLException;
import java.util.List;

@RestController
@RequestMapping("/portfolios")
public class PortfolioController {
    private final PortfolioService portfolioService;

    @Autowired
    public PortfolioController(PortfolioService portfolioService) {
        this.portfolioService = portfolioService;
    }

    @GetMapping("")
    public ResponseEntity<PagedResponse<DefaultPortfolioResDTO>> getPortfolios(@RequestParam("page") int page,
                                                @RequestParam("size") int size,
                                                @RequestParam("databaseName") String databaseName,
                                                @CookieValue("access_token") String jwt) throws SQLException, DatabaseNotFoundException {
        PagedResponse<DefaultPortfolioResDTO> portfolios =
                portfolioService.getPortfolios(page, size, databaseName, jwt);
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(portfolios);
    }

    @PostMapping("")
    public ResponseEntity<String> createPortfolios(@RequestBody List<PortfolioCreateReqDTO> reqDTOs,
                                                  @RequestParam("databaseName") String databaseName,
                                                  @RequestParam("jobId") Long jobId,
                                                   @CookieValue("access_token") String jwt) throws SQLException, DatabaseNotFoundException, InterruptedException {
        portfolioService.createPortfolios(reqDTOs, databaseName, jobId, jwt);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .build();
    }

    @DeleteMapping("")
    public ResponseEntity<String> deletePortfolio(@RequestBody List<Long> portfolioIds,
                                                  @RequestParam("jobId") Long jobId,
                                                  @RequestParam("databaseName") String databaseName,
                                                  @CookieValue("access_token") String jwt) throws SQLException, DatabaseNotFoundException {
        portfolioService.deletePortfolio(portfolioIds, databaseName, jobId, jwt);
        return ResponseEntity
                .status(HttpStatus.NO_CONTENT)
                .build();
    }

    @PutMapping("")
    public ResponseEntity<String> updatePortfolio(@RequestBody List<PortfolioUpdateReqDTO> reqDTOs,
                                                  @RequestParam("jobId") Long jobId,
                                                  @RequestParam("databaseName") String databaseName,
                                                  @CookieValue("access_token") String jwt) throws SQLException, DatabaseNotFoundException {
        portfolioService.updatePortfolio(reqDTOs, databaseName, jobId, jwt);
        return ResponseEntity
                .status(HttpStatus.OK)
                .build();
    }
}
