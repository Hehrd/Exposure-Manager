package com.project.org.service;

import com.project.org.controller.dto.request.ReqDTO;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public abstract class DataService<T> extends SqlService{

    protected DataService(String url, String user, String password) {
        super(url, user, password);
    }

    protected List<T> getRows(ResultSet rs) throws SQLException {
        List<T> rows = new ArrayList<>();
        while (rs.next()) {
            T row = getRow(rs);
            rows.add(row);
        }
        rs.close();
        return rows;
    }

    protected abstract T getRow(ResultSet rs) throws SQLException;



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
}
