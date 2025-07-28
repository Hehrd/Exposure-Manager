package com.project.org.service;

import com.project.org.controller.dto.request.ReqDTO;
import com.project.org.controller.dto.request.policy.PolicyCreateReqDTO;
import com.project.org.controller.dto.request.policy.PolicyDeleteReqDTO;
import com.project.org.controller.dto.request.policy.PolicyUpdateReqDTO;
import com.project.org.controller.dto.response.DefaultPolicyResDTO;
import com.project.org.controller.dto.response.PagedResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

@Service
public class PolicyService extends DataService<DefaultPolicyResDTO> {
    @Autowired
    public PolicyService(@Value("${db.default.url}") String url,
                           @Value("${db.default.user}") String user,
                           @Value("${db.default.password}") String password) {
        super(url, user, password);
    }

    public PagedResponse<DefaultPolicyResDTO> getPolicies(int page,
                                                 int size,
                                                 String databaseName,
                                                 Long accountId,
                                                 Long ownerId) throws SQLException {
        if (doesDatabaseExist(databaseName)) {
            String whereClause = "JOIN accounts ON policies.account_id = accounts.id " +
                    "WHERE policies.account_id = ? AND accounts.owner_id = ?";
            String selectSql = String.format("SELECT * FROM policies %s LIMIT ? OFFSET ?", whereClause);
            String countSql = String.format("SELECT COUNT(*) FROM policies %s", whereClause);
            Connection selectConnection = createConnection(databaseName);
            PreparedStatement selectStatement = selectConnection.prepareStatement(selectSql);
            selectStatement.setLong(1, accountId);
            selectStatement.setLong(2, ownerId);
            selectStatement.setInt(3, size);
            selectStatement.setInt(4, page * size);

            PreparedStatement countStatement = selectConnection.prepareStatement(countSql);
            countStatement.setLong(1, accountId);
            countStatement.setLong(2, ownerId);


            PagedResponse<DefaultPolicyResDTO> pagedResponse =
                    getRows(selectStatement.executeQuery(), countStatement);
            pagedResponse.setPageNumber(page);
            pagedResponse.setPageSize(size);
            return pagedResponse;
        }
        return null;
    }


    public void createPolicy(List<PolicyCreateReqDTO> policies, String databaseName,
                             Long ownerId) throws SQLException {
        if (doesDatabaseExist(databaseName)) {
            Connection createConnection = createConnection(databaseName);
            executeCreates(createConnection, policies, ownerId);
            createConnection.close();
        }
    }

    public void deletePolicy(List<Long> policyIds, String databaseName,
                             Long ownerId) throws SQLException {
        if (doesDatabaseExist(databaseName)) {
            deleteRows(databaseName, "policies", policyIds);
        }
    }

    public void updatePolicy(List<PolicyUpdateReqDTO> policies, String databaseName, Long ownerId) throws SQLException {
        if (doesDatabaseExist(databaseName)) {
            Connection updateConnection = createConnection(databaseName);
            executeUpdates(updateConnection, policies);
            updateConnection.close();
        }
    }





    @Override
    protected DefaultPolicyResDTO getRow(ResultSet rs) throws SQLException {
        DefaultPolicyResDTO policy = new DefaultPolicyResDTO();
        policy.setId(rs.getLong("id"));
        policy.setName(rs.getString("name"));
        policy.setCoverage(rs.getLong("coverage"));
        policy.setStartDate(rs.getDate("start_date"));
        policy.setExpirationDate(rs.getDate("expiration_date"));
        policy.setPerilType(rs.getString("peril_type"));
        policy.setAccountId(rs.getLong("account_id"));
        return policy;
    }

    @Override
    protected PreparedStatement prepareCreateStatement(Connection connection, ReqDTO reqDTO, Long ownerId) throws SQLException {
        String createSql = "INSERT INTO policies (name, start_date, expiration_date, coverage, peril_type, account_id) " +
                "VALUES (?, ?, ?, ?, ?, ?)";
        PolicyCreateReqDTO policy = (PolicyCreateReqDTO) reqDTO;
        PreparedStatement createStatement = connection.prepareStatement(createSql);
        createStatement.setString(1, policy.getName());
        createStatement.setDate(2, policy.getStartDate());
        createStatement.setDate(3, policy.getExpirationDate());
        createStatement.setLong(4, policy.getCoverage());
        createStatement.setString(5, policy.getPerilType());
        createStatement.setLong(6, policy.getAccountId());
        return createStatement;
    }

    @Override
    protected PreparedStatement prepareUpdateStatement(Connection connection, ReqDTO reqDTO) throws SQLException {
        String updateSql = "UPDATE policies " +
                "SET name = ?, start_date = ?, expiration_date = ?, coverage = ?, peril_type = ?, account_id = ? " +
                "WHERE id = ?";
        PolicyUpdateReqDTO policy = (PolicyUpdateReqDTO) reqDTO;
        PreparedStatement updateStatement = connection.prepareStatement(updateSql);
        updateStatement.setString(1, policy.getName());
        updateStatement.setDate(2, policy.getStartDate());
        updateStatement.setDate(3, policy.getExpirationDate());
        updateStatement.setLong(4, policy.getCoverage());
        updateStatement.setString(5, policy.getPerilType());
        updateStatement.setLong(6, policy.getAccountId());
        updateStatement.setLong(7, policy.getId());
        return updateStatement;
    }
}
