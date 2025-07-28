package com.project.org.service;

import com.project.org.controller.dto.request.ReqDTO;
import com.project.org.controller.dto.request.location.LocationCreateReqDTO;
import com.project.org.controller.dto.request.location.LocationUpdateReqDTO;
import com.project.org.controller.dto.response.DefaultLocationResDTO;
import com.project.org.controller.dto.response.PagedResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

@Service
public class LocationService extends DataService<DefaultLocationResDTO> {

    @Autowired
    public LocationService(@Value("${db.default.url}") String url,
                          @Value("${db.default.user}") String user,
                          @Value("${db.default.password}") String password) {
        super(url, user, password);
    }

    public PagedResponse<DefaultLocationResDTO> getLocations(int page,
                                                             int size,
                                                             String databaseName,
                                                             Long accountId,
                                                             Long ownerId) throws SQLException {
        if (doesDatabaseExist(databaseName)) {
            String whereClause = "JOIN accounts ON locations.account_id = accounts.id " +
                    "WHERE locations.account_id = ? AND accounts.owner_id = ?";
            String selectSql = String.format("SELECT * FROM locations %s LIMIT ? OFFSET ?", whereClause);
            String countSql = String.format("SELECT COUNT(*) FROM locations %s", whereClause);
            Connection selectConnection = createConnection(databaseName);
            PreparedStatement selectStatement = selectConnection.prepareStatement(selectSql);
            selectStatement.setLong(1, accountId);
            selectStatement.setLong(2, ownerId);
            selectStatement.setInt(3, size);
            selectStatement.setInt(4, page * size);

            PreparedStatement countStatement = selectConnection.prepareStatement(countSql);
            countStatement.setLong(1, accountId);
            countStatement.setLong(2, ownerId);

            PagedResponse<DefaultLocationResDTO> pagedResponse =
                    getRows(selectStatement.executeQuery(), countStatement);
            pagedResponse.setPageNumber(page);
            pagedResponse.setPageSize(size);
            return pagedResponse;
        }
        return null;

    }

    public void createLocations(List<LocationCreateReqDTO> locations, String databaseName,
                                Long ownerId) throws SQLException {
        if (doesDatabaseExist(databaseName)) {
            Connection createConnection = createConnection(databaseName);
            executeCreates(createConnection, locations, null);
            createConnection.close();
        }
    }

    public void deleteLocations(List<Long> locationIds, String databaseName,
                                Long ownerId) throws SQLException {
        if (doesDatabaseExist(databaseName)) {
            deleteRows(databaseName,
                    "locations",
                    locationIds);
        }
    }

    public void updateLocations(List<LocationUpdateReqDTO> locations, String databaseName, Long ownerId) throws SQLException {
        if (doesDatabaseExist(databaseName)) {
            Connection updateConnection = createConnection(databaseName);
            executeUpdates(updateConnection, locations);
            updateConnection.close();
        }
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
        String createSql = "INSERT INTO locations (name, address, country, city, zip_code, account_id) " +
                "VALUES (?, ?, ?, ?, ?, ?)";
        PreparedStatement createStatement = connection.prepareStatement(createSql);
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
        String updateSql = "UPDATE locations " +
                "SET name = ?, address = ?, country = ?, city = ?, zip_code = ?, account_id = ? " +
                "WHERE id = ?";
        PreparedStatement updateStatement = connection.prepareStatement(updateSql);
        updateStatement.setString(1, location.getName());
        updateStatement.setString(2, location.getAddress());
        updateStatement.setString(3, location.getCountry());
        updateStatement.setString(4, location.getCity());
        updateStatement.setInt(5, location.getZipCode());
        updateStatement.setLong(6, location.getAccountId());
        updateStatement.setLong(7, location.getId());
        return updateStatement;
    }




}
