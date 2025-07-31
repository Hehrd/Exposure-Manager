package com.project.org.service;

import com.project.org.controller.dto.request.database.DatabaseCreateReqDTO;
import com.project.org.controller.dto.request.database.DatabaseRenameReqDTO;
import com.project.org.error.exception.DatabaseNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.sql.*;
import java.util.List;

@Service
public class DatabaseService extends SqlService{

    @Autowired
    public DatabaseService(@Value("${db.default.url}") String url,
                           @Value("${db.default.user}") String user,
                           @Value("${db.default.password}") String password,
                           RestTemplate restTemplate, JwtService jwtService) {
        super(url, user, password, restTemplate, jwtService);
    }



    public void createDatabaseIfNotExists(List<DatabaseCreateReqDTO> reqDTOs, Long jobId,
                                          String jwt) throws SQLException, IOException, DatabaseNotFoundException {
        Connection createConnection = createConnection("postgres");
        for (DatabaseCreateReqDTO reqDTO : reqDTOs) {
            String databaseName = reqDTO.getName().toLowerCase();
            String createSql = String.format("CREATE DATABASE %s", databaseName);
            try {
                verifyDatabase(databaseName, true);
            } catch (DatabaseNotFoundException e) {
                Statement createStatement = createConnection.createStatement();
                createStatement.execute(createSql);
                createStatement.close();
                initDatabase(databaseName);
            }
        }
        createConnection.close();
        finishJob(jobId, jwt);
    }

    public void deleteDatabase(List<String> databaseNames, Long jobId,
                               String jwt) throws SQLException, DatabaseNotFoundException {
        Connection connection = createConnection("postgres");
        for (String databaseName : databaseNames) {
            String deleteSql = String.format("DROP DATABASE %s", databaseName.toLowerCase());
            databaseName = databaseName.toLowerCase();
            verifyDatabase(databaseName, true);
            Statement deleteStatement = connection.createStatement();
            deleteStatement.execute(deleteSql);
            deleteStatement.close();
        }
        connection.close();
        finishJob(jobId, jwt);
    }

    public void renameDatabase(List<DatabaseRenameReqDTO> reqDTOS, Long jobId,
                               String jwt) throws SQLException, DatabaseNotFoundException {
        Connection renameConnection = createConnection("postgres");
        for (DatabaseRenameReqDTO reqDTO : reqDTOS) {
            String oldName = reqDTO.getOldName().toLowerCase();
            String newName = reqDTO.getNewName().toLowerCase();
            String renameSql = String.format("ALTER DATABASE %s RENAME TO %s", oldName, newName);
            verifyDatabase(oldName, true);
            verifyDatabase(newName, false);
            Statement alterStatement = renameConnection.createStatement();
            alterStatement.execute(renameSql);
            alterStatement.close();
        }
        renameConnection.close();
        finishJob(jobId, jwt);
    }

    private void initDatabase(String databaseName) throws SQLException, IOException {
        Connection connection = createConnection(databaseName);
        Statement statement = connection.createStatement();
        executeSqlFromScript(statement, "create_tables_if_not_exists.sql");
        statement.close();
        connection.close();
    }





    private void executeSqlFromScript(Statement statement, String fileName) throws IOException, SQLException {
        String path = String.format("src/main/resources/sql/%s", fileName);
        BufferedReader br = new BufferedReader(new FileReader(path));
        StringBuffer sql = new StringBuffer();
        String line = br.readLine();
        while(line != null) {
            sql.append(line).append(" ");
            if(line.trim().endsWith(";")) {
                statement.execute(sql.toString().trim());
                sql = new StringBuffer();
            }
            line = br.readLine();
        }

    }

}
