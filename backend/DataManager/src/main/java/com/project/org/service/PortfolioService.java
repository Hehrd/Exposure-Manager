package com.project.org.service;

import com.project.org.controller.dto.request.ReqDTO;
import com.project.org.controller.dto.request.portfolio.PortfolioCreateReqDTO;
import com.project.org.controller.dto.request.portfolio.PortfolioUpdateReqDTO;
import com.project.org.controller.dto.response.DefaultPortfolioResDTO;
import com.project.org.controller.dto.response.PagedResponse;
import com.project.org.error.exception.DatabaseNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PortfolioService extends DataService<DefaultPortfolioResDTO> {


    @Autowired
    public PortfolioService(@Value("${db.default.url}") String url,
                            @Value("${db.default.user}") String user,
                            @Value("${db.default.password}") String password,
                            RestTemplate restTemplate, JwtService jwtService) {
        super(url, user, password, restTemplate, jwtService);
    }

    public PagedResponse<DefaultPortfolioResDTO> getPortfolios(int page,
                                                               int size,
                                                               String databaseName,
                                                               String jwt) throws SQLException, DatabaseNotFoundException {
        verifyDatabase(databaseName);
        Connection selectConnection = createConnection(databaseName);
        PreparedStatement selectStatement = selectConnection.prepareStatement(sqls.get("select"));
        selectStatement.setInt(1, size);
        selectStatement.setInt(2, page * size);

        PreparedStatement countStatement = selectConnection.prepareStatement(sqls.get("count"));

        PagedResponse<DefaultPortfolioResDTO> pagedResponse =
                getRows(selectStatement, countStatement);
        pagedResponse.setPageNumber(page);
        pagedResponse.setPageSize(size);

        selectConnection.close();
        return pagedResponse;
    }

    public void createPortfolios(List<PortfolioCreateReqDTO> portfolios, String databaseName,
                                 Long jobId, String jwt) throws SQLException, DatabaseNotFoundException {
        verifyDatabase(databaseName);
        Long ownerId = jwtService.extractUserId(jwt);
        Connection createConnection = createConnection(databaseName);
        executeCreates(createConnection, portfolios, ownerId);
        createConnection.close();
        finishJob(jobId, jwt);
    }

    public void deletePortfolio(List<Long> portfolioIds, String databaseName, Long jobId,
                                String jwt) throws SQLException, DatabaseNotFoundException {
        verifyDatabase(databaseName);
        deleteRows(databaseName, "portfolios", portfolioIds);
        finishJob(jobId, jwt);
    }

    public void updatePortfolio(List<PortfolioUpdateReqDTO> portfolios, String databaseName, Long jobId,
                                String jwt) throws SQLException, DatabaseNotFoundException {
        verifyDatabase(databaseName);
        Connection updateConnection = createConnection(databaseName);
        executeUpdates(updateConnection, portfolios);
        updateConnection.close();
        finishJob(jobId, jwt);
    }

    @Override
    protected DefaultPortfolioResDTO getRow(ResultSet rs) throws SQLException {
        DefaultPortfolioResDTO portfolio = new DefaultPortfolioResDTO();
        portfolio.setId(rs.getLong("id"));
        portfolio.setName(rs.getString("name"));
        return portfolio;
    }



    @Override
    protected PreparedStatement prepareCreateStatement(Connection connection, ReqDTO reqDTO, Long ownerId) throws SQLException {
        PortfolioCreateReqDTO portfolio = (PortfolioCreateReqDTO) reqDTO;
        PreparedStatement createStatement = connection.prepareStatement(sqls.get("insert"));
        createStatement.setString(1, portfolio.getName());
        createStatement.setLong(2, ownerId);
        return createStatement;
    }

    @Override
    protected PreparedStatement prepareUpdateStatement(Connection connection, ReqDTO reqDTO) throws SQLException {
        PortfolioUpdateReqDTO portfolio = (PortfolioUpdateReqDTO) reqDTO;
        PreparedStatement updateStatement = connection.prepareStatement(sqls.get("update"));
        updateStatement.setString(1, portfolio.getName());
        updateStatement.setLong(2, portfolio.getId());
        return updateStatement;
    }

    @Override
    protected Map<String, String> initSqls() {
        Map<String, String> sqls = new HashMap<>();
        sqls.put("select", "SELECT * FROM portfolios LIMIT ? OFFSET ?");
        sqls.put("count", "SELECT COUNT(*) FROM portfolios");
        sqls.put("insert", "INSERT INTO portfolios (name, owner_id) VALUES (?, ?)");
        sqls.put("update", "UPDATE portfolios SET name = ? WHERE id = ?");
        return sqls;
    }

}
