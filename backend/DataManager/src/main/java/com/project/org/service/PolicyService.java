package com.project.org.service;

import com.project.org.controller.dto.request.ReqDTO;
import com.project.org.controller.dto.request.policy.PolicyCreateReqDTO;
import com.project.org.controller.dto.request.policy.PolicyUpdateReqDTO;
import com.project.org.controller.dto.response.DefaultPolicyResDTO;
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
public class PolicyService extends DataService<DefaultPolicyResDTO> {
    @Autowired
    public PolicyService(@Value("${db.default.url}") String url,
                         @Value("${db.default.user}") String user,
                         @Value("${db.default.password}") String password,
                         RestTemplate restTemplate, JwtService jwtService) {
        super(url, user, password, restTemplate, jwtService);
    }

    public PagedResponse<DefaultPolicyResDTO> getPolicies(int page,
                                                 int size,
                                                 String databaseName,
                                                 Long accountId,
                                                 String jwt) throws SQLException, DatabaseNotFoundException {
        verifyDatabase(databaseName);
        Connection selectConnection = createConnection(databaseName);
        PreparedStatement selectStatement = selectConnection.prepareStatement(sqls.get("select"));
        selectStatement.setLong(1, accountId);
        selectStatement.setInt(2, size);
        selectStatement.setInt(3, page * size);

        PreparedStatement countStatement = selectConnection.prepareStatement(sqls.get("count"));
        countStatement.setLong(1, accountId);


        PagedResponse<DefaultPolicyResDTO> pagedResponse =
                getRows(selectStatement, countStatement);
        pagedResponse.setPageNumber(page);
        pagedResponse.setPageSize(size);

        selectConnection.close();
        return pagedResponse;
    }


    public void createPolicy(List<PolicyCreateReqDTO> policies, String databaseName,
                             Long jobId, String jwt) throws SQLException, DatabaseNotFoundException {
        verifyDatabase(databaseName);
        Long ownerId = jwtService.extractUserId(jwt);
        Connection createConnection = createConnection(databaseName);
        executeCreates(createConnection, policies, ownerId);
        createConnection.close();
        finishJob(jobId, jwt);
    }

    public void deletePolicy(List<Long> policyIds, String databaseName,
                             Long jobId, String jwt) throws SQLException, DatabaseNotFoundException {
        verifyDatabase(databaseName);
        deleteRows(databaseName, "policies", policyIds);
        finishJob(jobId, jwt);
    }

    public void updatePolicy(List<PolicyUpdateReqDTO> policies, String databaseName,
                             Long jobId, String jwt) throws SQLException, DatabaseNotFoundException {
        verifyDatabase(databaseName);
        Connection updateConnection = createConnection(databaseName);
        executeUpdates(updateConnection, policies);
        updateConnection.close();
        finishJob(jobId, jwt);
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
        PolicyCreateReqDTO policy = (PolicyCreateReqDTO) reqDTO;
        PreparedStatement createStatement = connection.prepareStatement(sqls.get("insert"));
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
        PolicyUpdateReqDTO policy = (PolicyUpdateReqDTO) reqDTO;
        PreparedStatement updateStatement = connection.prepareStatement(sqls.get("update"));
        updateStatement.setString(1, policy.getName());
        updateStatement.setDate(2, policy.getStartDate());
        updateStatement.setDate(3, policy.getExpirationDate());
        updateStatement.setLong(4, policy.getCoverage());
        updateStatement.setString(5, policy.getPerilType());
        updateStatement.setLong(6, policy.getAccountId());
        updateStatement.setLong(7, policy.getId());
        return updateStatement;
    }

    @Override
    protected Map<String, String> initSqls() {
        Map<String, String> sqls = new HashMap<>();
        sqls.put("select", "SELECT * FROM policies WHERE account_id = ? LIMIT ? OFFSET ?");
        sqls.put("count", "SELECT COUNT(*) FROM policies WHERE account_id = ?");
        sqls.put("insert", "INSERT INTO policies (name, start_date, expiration_date, coverage, peril_type, account_id) VALUES (?, ?, ?, ?, ?, ?)");
        sqls.put("update", "UPDATE policies SET name = ?, start_date = ?, expiration_date = ?, coverage = ?, peril_type = ?, account_id = ? WHERE id = ?");
        return sqls;
    }
}
