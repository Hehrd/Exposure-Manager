package com.project.org.service;

import org.springframework.web.client.RestTemplate;

import java.sql.*;

public abstract class SqlService {
    protected final String DEFAULT_DATABASE_URL;
    protected final String DEFAULT_DATABASE_USER;
    protected final String DEFAULT_DATABASE_PASSWORD;
    protected final RestTemplate restTemplate;

    protected SqlService(String url,
                         String user,
                         String password,
                         RestTemplate restTemplate) {
        this.DEFAULT_DATABASE_URL = url;
        this.DEFAULT_DATABASE_USER = user;
        this.DEFAULT_DATABASE_PASSWORD = password;
        this.restTemplate = restTemplate;
    }

    protected Connection createConnection(String databaseName) throws SQLException {
        String url = String.format("jdbc:postgresql://localhost:5432/%s", databaseName);
        return DriverManager.getConnection(url,
                DEFAULT_DATABASE_USER,
                DEFAULT_DATABASE_PASSWORD);
    }

    protected boolean doesDatabaseExist(String databaseName) throws SQLException {
        Connection connection = createConnection("postgres");
        String checkSql = "SELECT 1 FROM pg_database WHERE datname = ?";
        PreparedStatement checkStatement = connection.prepareStatement(checkSql);
        checkStatement.setString(1, databaseName);
        ResultSet rs = checkStatement.executeQuery();
        boolean exists = rs.next();
        checkStatement.close();
        return exists;
    }

    protected void deleteRow(String databaseName, String tableName, Long id) throws SQLException {
        String deleteSql = String.format("DELETE FROM %s WHERE id = ?", tableName);
        Connection deleteConnection = createConnection(databaseName);
        PreparedStatement deleteStatement = deleteConnection.prepareStatement(deleteSql);
        deleteStatement.setLong(1, id);
        deleteStatement.executeUpdate();
        deleteStatement.close();
        deleteConnection.close();
    }

    protected void renameRow(String databaseName,
                             String tableName,
                             Long id,
                             String newName) throws SQLException {
        String renameSql = String.format("UPDATE %s SET name = ? WHERE id = ?", tableName);
        Connection renameConnection = createConnection(databaseName);
        PreparedStatement renameStatement = renameConnection.prepareStatement(renameSql);
        renameStatement.setString(1, newName);
        renameStatement.setLong(2, id);
        renameStatement.executeUpdate();
        renameStatement.close();
        renameConnection.close();
    }
}
