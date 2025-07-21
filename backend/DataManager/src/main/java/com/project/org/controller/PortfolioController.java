package com.project.org.controller;

import com.project.org.controller.dto.request.portfolio.PortfolioCreateReqDTO;
import com.project.org.controller.dto.request.portfolio.PortfolioDeleteReqDTO;
import com.project.org.controller.dto.request.portfolio.PortfolioUpdateReqDTO;
import com.project.org.controller.dto.response.DefaultPortfolioResDTO;
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
    public ResponseEntity<List<DefaultPortfolioResDTO>> getPortfolios(@RequestParam("page") int page,
                                                @RequestParam("size") int size,
                                                @RequestParam("databaseName") String databaseName,
                                                @CookieValue("ownerId") Long ownerId) throws SQLException {
        List<DefaultPortfolioResDTO> portfolios =
                portfolioService.getPortfolios(page, size, databaseName, ownerId);
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(portfolios);
    }

    @PostMapping("")
    public ResponseEntity<String> createPortfolios(@RequestBody List<PortfolioCreateReqDTO> reqDTOs,
                                                  @RequestParam("databaseName") String databaseName,
                                                  @CookieValue("ownerId") Long ownerId) throws SQLException {
        portfolioService.createPortfolios(reqDTOs, databaseName, ownerId);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .build();
    }

    @DeleteMapping("")
    public ResponseEntity<String> deletePortfolio(@RequestBody List<Long> portfolioIds,
                                                  @RequestParam("databaseName") String databaseName) throws SQLException {
        portfolioService.deletePortfolio(portfolioIds, databaseName);
        return ResponseEntity
                .status(HttpStatus.NO_CONTENT)
                .build();
    }

    @PutMapping("")
    public ResponseEntity<String> updatePortfolio(@RequestBody List<PortfolioUpdateReqDTO> reqDTOs,
                                                  @RequestParam("databaseName") String databaseName) throws SQLException {
        portfolioService.updatePortfolio(reqDTOs, databaseName);
        return ResponseEntity
                .status(HttpStatus.OK)
                .build();
    }
}
