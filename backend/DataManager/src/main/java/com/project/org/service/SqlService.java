package com.project.org.service;

import com.project.org.controller.dto.request.ReqDTO;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public abstract class SqlService {
    protected final String DEFAULT_DATABASE_URL;
    protected final String DEFAULT_DATABASE_USER;
    protected final String DEFAULT_DATABASE_PASSWORD;

    protected SqlService(String url,
                         String user,
                         String password) {
        this.DEFAULT_DATABASE_URL = url;
        this.DEFAULT_DATABASE_USER = user;
        this.DEFAULT_DATABASE_PASSWORD = password;
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



}
