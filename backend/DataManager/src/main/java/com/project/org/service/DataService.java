package com.project.org.service;

import com.project.org.controller.dto.request.ReqDTO;
import com.project.org.controller.dto.response.PagedResponse;
import org.springframework.web.client.RestTemplate;

import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public abstract class DataService<T> extends SqlService{
    protected final Map<String, String> sqls;

    protected DataService(String url, String user, String password, RestTemplate restTemplate,
                          JwtService jwtService) {
        super(url, user, password, restTemplate, jwtService);
        sqls = initSqls();
    }

    protected PagedResponse<T> getRows(PreparedStatement selectStatement, PreparedStatement countStatement) throws SQLException {
        PagedResponse<T> pagedResponse = new PagedResponse<>();
        ResultSet rs = selectStatement.executeQuery();
        while (rs.next()) {
            T row = getRow(rs);
            pagedResponse.addElement(row);
        }
        rs.close();
        int totalElements = getTotalElements(countStatement);
        pagedResponse.setTotalElements(totalElements);
        return pagedResponse;
    }

    protected abstract T getRow(ResultSet rs) throws SQLException;

    private int getTotalElements(PreparedStatement countStatement) throws SQLException {
        ResultSet rs = countStatement.executeQuery();
        rs.next();
        int totalElements = rs.getInt("count");
        rs.close();
        return totalElements;
    }

    protected void deleteRows(String databaseName, String tableName, List<Long> ids) throws SQLException {
        String deleteSql = String.format("DELETE FROM %s WHERE id = ?", tableName);
        Connection deleteConnection = createConnection(databaseName);
        for (Long id : ids) {
            PreparedStatement deleteStatement = deleteConnection.prepareStatement(deleteSql);
            deleteStatement.setLong(1, id);
            deleteStatement.executeUpdate();
            deleteStatement.close();
        }

        deleteConnection.close();
    }



    protected abstract PreparedStatement prepareCreateStatement(Connection connection, ReqDTO reqDTO, Long ownerId) throws SQLException;
    protected abstract PreparedStatement prepareUpdateStatement(Connection connection, ReqDTO reqDTO) throws SQLException;

    protected void executeUpdates(Connection connection, List<? extends ReqDTO> reqDTOs) throws SQLException {
        for (ReqDTO reqDTO : reqDTOs) {
            PreparedStatement updateStatement = prepareUpdateStatement(connection, reqDTO);
            updateStatement.executeUpdate();
            updateStatement.close();
        }
    }

    protected void executeCreates(Connection connection, List<? extends ReqDTO> reqDTOs, Long ownerId) throws SQLException {
        for (ReqDTO reqDTO : reqDTOs) {
            PreparedStatement updateStatement = prepareCreateStatement(connection, reqDTO, ownerId);
            updateStatement.executeUpdate();
            updateStatement.close();
        }
    }

    protected abstract Map<String, String> initSqls();
}
