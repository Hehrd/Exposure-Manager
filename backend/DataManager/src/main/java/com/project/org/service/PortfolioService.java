package com.project.org.service;

import com.project.org.controller.dto.request.ReqDTO;
import com.project.org.controller.dto.request.portfolio.PortfolioCreateReqDTO;
import com.project.org.controller.dto.request.portfolio.PortfolioUpdateReqDTO;
import com.project.org.controller.dto.response.DefaultPortfolioResDTO;
import com.project.org.controller.dto.response.PagedResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

@Service
public class PortfolioService extends DataService<DefaultPortfolioResDTO> {

    @Autowired
    public PortfolioService(@Value("${db.default.url}") String url,
                           @Value("${db.default.user}") String user,
                           @Value("${db.default.password}") String password) {
        super(url, user, password);
    }

    public PagedResponse<DefaultPortfolioResDTO> getPortfolios(int page,
                                                               int size,
                                                               String databaseName,
                                                               Long ownerId) throws SQLException {
        if (doesDatabaseExist(databaseName)) {
            String whereClause = "WHERE owner_id = ?";
            String selectSql = String.format("SELECT * FROM portfolios %s LIMIT ? OFFSET ?", whereClause);
            String countSql = String.format("SELECT COUNT(*) FROM portfolios %s", whereClause);
            Connection selectConnection = createConnection(databaseName);
            PreparedStatement selectStatement = selectConnection.prepareStatement(selectSql);
            selectStatement.setLong(1, ownerId);
            selectStatement.setInt(2, size);
            selectStatement.setInt(3, page * size);

            PreparedStatement countStatement = selectConnection.prepareStatement(countSql);
            countStatement.setLong(1, ownerId);


            PagedResponse<DefaultPortfolioResDTO> pagedResponse =
                    getRows(selectStatement.executeQuery(), countStatement);
            pagedResponse.setPageNumber(page);
            pagedResponse.setPageSize(size);
            return pagedResponse;
        }
        return null;
    }

    public void createPortfolios(List<PortfolioCreateReqDTO> portfolios,
                                 String databaseName,
                                 Long ownerId) throws SQLException {
        if (doesDatabaseExist(databaseName)) {
            Connection createConnection = createConnection(databaseName);
            executeCreates(createConnection, portfolios, ownerId);
            createConnection.close();
        }
    }

    public void deletePortfolio(List<Long> portfolioIds, String databaseName) throws SQLException {
        if (doesDatabaseExist(databaseName)) {
                deleteRows(databaseName, "portfolios", portfolioIds);
        }
    }

    public void updatePortfolio(List<PortfolioUpdateReqDTO> portfolios, String databaseName) throws SQLException {
        if (doesDatabaseExist(databaseName)) {
            Connection updateConnection = createConnection(databaseName);
            executeUpdates(updateConnection, portfolios);
            updateConnection.close();
        }
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
        String createSql = "INSERT INTO portfolios (name, owner_id) VALUES (?, ?)";
        PortfolioCreateReqDTO portfolio = (PortfolioCreateReqDTO) reqDTO;
        PreparedStatement createStatement = connection.prepareStatement(createSql);
        createStatement.setString(1, portfolio.getName());
        createStatement.setLong(2, ownerId);
        return createStatement;
    }

    @Override
    protected PreparedStatement prepareUpdateStatement(Connection connection, ReqDTO reqDTO) throws SQLException {
        String updateSql = "UPDATE portfolios SET name = ? WHERE id = ?";
        PortfolioUpdateReqDTO portfolio = (PortfolioUpdateReqDTO) reqDTO;
        PreparedStatement updateStatement = connection.prepareStatement(updateSql);
        updateStatement.setString(1, portfolio.getName());
        updateStatement.setLong(2, portfolio.getId());
        return updateStatement;
    }

}
