package com.project.org.service;

import com.project.org.controller.dto.request.ReqDTO;
import com.project.org.controller.dto.request.account.AccountCreateReqDTO;
import com.project.org.controller.dto.request.account.AccountUpdateReqDTO;
import com.project.org.controller.dto.response.DefaultAccountResDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.sql.*;
import java.util.List;

@Service
public class AccountService extends DataService<DefaultAccountResDTO> {
    @Autowired
    public AccountService(@Value("${db.default.url}") String url,
                           @Value("${db.default.user}") String user,
                           @Value("${db.default.password}") String password) {
        super(url, user, password);
    }

    public List<DefaultAccountResDTO> getAccounts(int page, int size, String databaseName, Long portfolioId,
                                                  Long ownerId) throws SQLException {
        if (doesDatabaseExist(databaseName)) {
            String selectSql = "SELECT * FROM accounts " +
                    "WHERE portfolio_id = ? AND owner_id = ? " +
                    "LIMIT ? OFFSET ?";
            Connection selectConnection = createConnection(databaseName);
            PreparedStatement selectStatement = selectConnection.prepareStatement(selectSql);
            selectStatement.setLong(1, portfolioId);
            selectStatement.setLong(2, ownerId);
            selectStatement.setInt(3, size);
            selectStatement.setInt(4, page);
            return getRows(selectStatement.executeQuery());
        }
        return null;
    }

    public void createAccounts(List<AccountCreateReqDTO> accounts, String datbaseName,
                               Long ownerId) throws SQLException {
        if (doesDatabaseExist(datbaseName)) {
            Connection createConnection = createConnection(datbaseName);
            executeCreates(createConnection, accounts, ownerId);
            createConnection.close();
        }
    }

    public void deleteAccount(List<Long> accIds, String databaseName) throws SQLException {
        if (doesDatabaseExist(databaseName)) {
            for (Long accId : accIds) {
                deleteRow(databaseName,
                        "accounts",
                        accId);
            }
        }
    }

    public void updateAccount(List<AccountUpdateReqDTO> accounts, String databaseName) throws SQLException {
        if (doesDatabaseExist(databaseName)) {
            Connection updateConnection = createConnection(databaseName);
            executeUpdates(updateConnection, accounts);
            updateConnection.close();
        }
    }
    @Override
    protected DefaultAccountResDTO getRow(ResultSet rs) throws SQLException {
        DefaultAccountResDTO account = new DefaultAccountResDTO();
        account.setId(rs.getLong("id"));
        account.setName(rs.getString("name"));
        account.setPortfolioId(rs.getLong("portfolio_id"));
        return account;
    }

    @Override
    protected PreparedStatement prepareUpdateStatement(Connection connection, ReqDTO reqDTO) throws SQLException {
        AccountUpdateReqDTO account = (AccountUpdateReqDTO) reqDTO;
        String updateSql = "UPDATE accounts " +
                "SET name = ?, portfolio_id = ? " +
                "WHERE id = ?";
        PreparedStatement updateStatement = connection.prepareStatement(updateSql);
        updateStatement.setString(1, account.getName());
        updateStatement.setLong(2, account.getPortfolioId());
        updateStatement.setLong(3, account.getId());
        return updateStatement;
    }

    @Override
    protected PreparedStatement prepareCreateStatement(Connection connection,
                                        ReqDTO reqDTO,
                                        Long ownerId) throws SQLException {
        AccountCreateReqDTO account = (AccountCreateReqDTO) reqDTO;
        String createSql = "INSERT INTO accounts (name, portfolio_id, owner_id) VALUES (?, ?, ?)";
        PreparedStatement createStatement = connection.prepareStatement(createSql);
        createStatement.setString(1, account.getName());
        createStatement.setLong(2, account.getPortfolioId());
        createStatement.setLong(3, ownerId);
        return createStatement;
    }



}
