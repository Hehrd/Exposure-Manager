package com.project.org.service;

import com.project.org.controller.dto.request.ReqDTO;
import com.project.org.controller.dto.request.location.LocationCreateReqDTO;
import com.project.org.controller.dto.request.location.LocationUpdateReqDTO;
import com.project.org.controller.dto.response.DefaultLocationResDTO;
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
public class LocationService extends DataService<DefaultLocationResDTO> {

    @Autowired
    public LocationService(@Value("${db.default.url}") String url,
                           @Value("${db.default.user}") String user,
                           @Value("${db.default.password}") String password,
                           RestTemplate restTemplate, JwtService jwtService) {
        super(url, user, password, restTemplate, jwtService);
    }

    public PagedResponse<DefaultLocationResDTO> getLocations(int page,
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

        PagedResponse<DefaultLocationResDTO> pagedResponse =
                getRows(selectStatement, countStatement);
        pagedResponse.setPageNumber(page);
        pagedResponse.setPageSize(size);

        selectConnection.close();
        return pagedResponse;
    }

    public void createLocations(List<LocationCreateReqDTO> locations, String databaseName,
                                Long jobId, String jwt) throws SQLException, DatabaseNotFoundException {
        verifyDatabase(databaseName);
        Connection createConnection = createConnection(databaseName);
        executeCreates(createConnection, locations, null);
        createConnection.close();
        finishJob(jobId, jwt);
    }

    public void deleteLocations(List<Long> locationIds, String databaseName,
                                Long jobId, String jwt) throws SQLException, DatabaseNotFoundException {
        verifyDatabase(databaseName);
        deleteRows(databaseName,
                "locations",
                locationIds);
        finishJob(jobId, jwt);
    }

    public void updateLocations(List<LocationUpdateReqDTO> locations, String databaseName,
                                Long jobId, String jwt) throws SQLException, DatabaseNotFoundException {
        verifyDatabase(databaseName);
        Connection updateConnection = createConnection(databaseName);
        executeUpdates(updateConnection, locations);
        updateConnection.close();
        finishJob(jobId, jwt);
    }

    @Override
    protected DefaultLocationResDTO getRow(ResultSet rs) throws SQLException {
        DefaultLocationResDTO location = new DefaultLocationResDTO();
        location.setId(rs.getLong("id"));
        location.setName(rs.getString("name"));
        location.setAddress(rs.getString("address"));
        location.setCountry(rs.getString("country"));
        location.setCity(rs.getString("city"));
        location.setZipCode(rs.getInt("zip_code"));
        location.setAccountId(rs.getLong("account_id"));
        return location;
    }

    @Override
    protected PreparedStatement prepareCreateStatement(Connection connection, ReqDTO reqDTO, Long ownerId) throws SQLException {
        LocationCreateReqDTO location = (LocationCreateReqDTO) reqDTO;
        PreparedStatement createStatement = connection.prepareStatement(sqls.get("insert"));
        createStatement.setString(1, location.getName());
        createStatement.setString(2, location.getAddress());
        createStatement.setString(3, location.getCountry());
        createStatement.setString(4, location.getCity());
        createStatement.setInt(5, location.getZipCode());
        createStatement.setLong(6, location.getAccountId());
        return createStatement;
    }

    @Override
    protected PreparedStatement prepareUpdateStatement(Connection connection, ReqDTO reqDTO) throws SQLException {
        LocationUpdateReqDTO location = (LocationUpdateReqDTO) reqDTO;
        PreparedStatement updateStatement = connection.prepareStatement(sqls.get("update"));
        updateStatement.setString(1, location.getName());
        updateStatement.setString(2, location.getAddress());
        updateStatement.setString(3, location.getCountry());
        updateStatement.setString(4, location.getCity());
        updateStatement.setInt(5, location.getZipCode());
        updateStatement.setLong(6, location.getAccountId());
        updateStatement.setLong(7, location.getId());
        return updateStatement;
    }

    @Override
    protected Map<String, String> initSqls() {
        Map<String, String> sqls = new HashMap<>();
        sqls.put("select", "SELECT * FROM locations WHERE account_id = ? LIMIT ? OFFSET ?");
        sqls.put("count", "SELECT COUNT(*) FROM locations WHERE account_id = ?");
        sqls.put("insert", "INSERT INTO locations (name, address, country, city, zip_code, account_id) VALUES (?, ?, ?, ?, ?, ?)");
        sqls.put("update", "UPDATE locations SET name = ?, address = ?, country = ?, city = ?, zip_code = ?, account_id = ? WHERE id = ?");
        return sqls;
    }


}
