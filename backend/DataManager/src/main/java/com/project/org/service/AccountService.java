package com.project.org.service;

import com.project.org.controller.dto.request.ReqDTO;
import com.project.org.controller.dto.request.account.AccountCreateReqDTO;
import com.project.org.controller.dto.request.account.AccountUpdateReqDTO;
import com.project.org.controller.dto.response.DefaultAccountResDTO;
import com.project.org.controller.dto.response.PagedResponse;
import com.project.org.error.exception.DatabaseNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.sql.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AccountService extends DataService<DefaultAccountResDTO> {

    @Autowired
    public AccountService(@Value("${db.default.url}") String url,
                          @Value("${db.default.user}") String user,
                          @Value("${db.default.password}") String password,
                          RestTemplate restTemplate, JwtService jwtService) {
        super(url, user, password, restTemplate, jwtService);
    }

    public PagedResponse<DefaultAccountResDTO> getAccounts(int page, int size, String databaseName, Long portfolioId,
                                                           String jwt) throws SQLException, DatabaseNotFoundException {
        verifyDatabase(databaseName, true);
        Connection selectConnection = createConnection(databaseName);
        PreparedStatement selectStatement = selectConnection.prepareStatement(sqls.get("select"));
        selectStatement.setLong(1, portfolioId);
        selectStatement.setInt(2, size);
        selectStatement.setInt(3, page * size);

        PreparedStatement countStatement = selectConnection.prepareStatement(sqls.get("count"));
        countStatement.setLong(1, portfolioId);
        PagedResponse<DefaultAccountResDTO> pagedResponse =
                getRows(selectStatement, countStatement);
        pagedResponse.setPageNumber(page);
        pagedResponse.setPageSize(size);

        selectConnection.close();
        return pagedResponse;
    }

//    protected PreparedStatement prepareSelectStatement(Connection connection, int page, int size) {
//
//    }

    public void createAccounts(List<AccountCreateReqDTO> accounts, String databaseName,
                               Long jobId, String jwt) throws SQLException, DatabaseNotFoundException {
        verifyDatabase(databaseName, true);
        Long ownerId = jwtService.extractUserId(jwt);
        Connection createConnection = createConnection(databaseName);
        executeCreates(createConnection, accounts, ownerId);
        createConnection.close();
        finishJob(jobId, jwt);
    }

    public void deleteAccount(List<Long> accIds, String databaseName, Long jobId, String jwt) throws SQLException, DatabaseNotFoundException {
        verifyDatabase(databaseName, true);
        deleteRows(databaseName, "accounts", accIds);
        finishJob(jobId, jwt);
    }
    public void updateAccount(List<AccountUpdateReqDTO> accounts, String databaseName, Long jobId,
                              String jwt) throws SQLException, DatabaseNotFoundException {
        verifyDatabase(databaseName, true);
        Connection updateConnection = createConnection(databaseName);
        executeUpdates(updateConnection, accounts);
        updateConnection.close();
        finishJob(jobId, jwt);
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
        PreparedStatement updateStatement = connection.prepareStatement(sqls.get("update"));
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
        PreparedStatement createStatement = connection.prepareStatement(sqls.get("insert"));
        createStatement.setString(1, account.getName());
        createStatement.setLong(2, account.getPortfolioId());
        createStatement.setLong(3, ownerId);
        return createStatement;
    }

    @Override
    protected Map<String, String> initSqls() {
        Map<String, String> sqls = new HashMap<>();
        sqls.put("select", "SELECT * FROM accounts WHERE portfolio_id = ? LIMIT ? OFFSET ?");
        sqls.put("count", "SELECT COUNT(*) FROM accounts WHERE portfolio_id = ?");
        sqls.put("insert", "INSERT INTO accounts (name, portfolio_id, owner_id) VALUES (?, ?, ?)");
        sqls.put("update", "UPDATE accounts SET name = ?, portfolio_id = ? WHERE id = ?");
        return sqls;
    }



}
