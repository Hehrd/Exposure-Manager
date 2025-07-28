package com.project.org.service.sql;

import com.project.org.controller.dto.request.QueryRequestDTO;
import com.project.org.service.sql.model.BigCondition;
import com.project.org.service.sql.model.Join;
import com.project.org.service.sql.model.OrderFilter;
import org.springframework.stereotype.Service;

import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.List;

@Service
public class SqlInterpreterService {


    public String createStatementString(QueryRequestDTO query) throws SQLException {
        StringBuffer querySb = new StringBuffer();
        querySb.append("SELECT").append(" ");
        querySb.append(getColumnsBaseSqlString(query.getColumnNames())).append(" ");
        querySb.append(getFromBaseSqlString(query.getMainTableName())).append(" ");
        querySb.append(getJoinsBaseSqlString(query.getJoins())).append(" ");
        querySb.append(getWhereBaseSqlString(query.getWhere())).append(" ");
        querySb.append(getOrderByBaseSqlString(query.getOrderFilters())).append(" ");
        querySb.append(getLimitBaseSqlString(query.getLimit())).append(" ");
        querySb.append(getOffsetBaseSqlString(query.getOffset()));
        return querySb.toString().trim();
    }

    public void setValuesInStatement(PreparedStatement statement, QueryRequestDTO query) throws SQLException {
        int index = 1;
        index = setColumnValuesInStatement(statement, query.getColumnNames(), query.getMainTableName(), index);
        index = setFromValueInStatement(statement, query.getMainTableName(), index);
        index = setJoinValuesInStatement(statement, query.getJoins(), index);
        index = setWhereValuesInStatement(statement, query.getWhere(), index);
        index = setOrderValuesInStatement(statement, query.getOrderFilters(), index);
        index = setLimitValueInStatement(statement, query.getLimit(), index);
        index = setOffsetValueInStatement(statement, query.getOffset(), index);
    }

    private int setColumnValuesInStatement(PreparedStatement statement,
                                           List<String> columnNames,
                                           String mainTableName,
                                           int index) throws SQLException {
        if (columnNames != null && !columnNames.isEmpty()) {
            for (String columnName : columnNames) {
                statement.setString(index++, String.format("%s.%s", mainTableName, columnName));
            }
        }
        return index;
    }

    private int setFromValueInStatement(PreparedStatement statement,
                                        String mainTableName,
                                        Integer index) throws SQLException {
        statement.setString(index++, mainTableName);
        return index;
    }

    private int setJoinValuesInStatement(PreparedStatement statement, List<Join> joins, int index) throws SQLException {
        if (joins != null && !joins.isEmpty()) {
            for (Join join : joins) {
                statement.setString(index++, join.getMainTable());
                statement.setString(index++, join.getCondition().toString());
            }
        }
        return index;
    }

    private int setWhereValuesInStatement(PreparedStatement statement, BigCondition where, int index) throws SQLException {
        if (where != null) {
            statement.setObject(index++, where.toString());
        }
        return index;
    }

    private int setOrderValuesInStatement(PreparedStatement statement, List<OrderFilter> orderFilters, int index) throws SQLException {
        if (orderFilters != null && !orderFilters.isEmpty()) {
            for (OrderFilter filter : orderFilters) {
                statement.setString(index++, filter.toString());
            }
        }
        return index;
    }

    private int setLimitValueInStatement(PreparedStatement statement, Integer limit, int index) throws SQLException {
        if (limit != null) {
            statement.setInt(index++, limit);
        }
        return index;
    }

    private int setOffsetValueInStatement(PreparedStatement statement, Integer offset, int index) throws SQLException {
        if (offset != null) {
            statement.setInt(index++, offset);
        }
        return index;
    }



    private String getColumnsBaseSqlString(List<String> columns) {
        if (columns == null || columns.isEmpty()) {
            return "*";
        }
        StringBuffer columnsSb = new StringBuffer();
        columnsSb.append("?");
        for (int i = 1; i < columns.size(); i++) {
            columnsSb.append(",");
            columnsSb.append("?");
        }
        return columnsSb.toString();
    }

    private String getFromBaseSqlString(String mainTable) {
        return "FROM ?";
    }

    private String getJoinsBaseSqlString(List<Join> joins) {
        if (joins == null || joins.size() == 0) {
            return "";
        }
        StringBuffer joinsSb = new StringBuffer();
        String baseJoinString = "JOIN ? ON ?";
        joinsSb.append(baseJoinString);
        for (int i = 1; i < joins.size(); i++) {
            joinsSb.append(" ");
            joinsSb.append(baseJoinString);
        }
        return joinsSb.toString();
    }

    private String getWhereBaseSqlString(BigCondition whereCondition) {
        if (whereCondition == null) {
            return "";
        }
        return "WHERE ?";
    }

    private String getOrderByBaseSqlString(List<OrderFilter> orderFilters) {
        if (orderFilters == null || orderFilters.size() == 0) {
            return "";
        }
        StringBuffer orderBySb = new StringBuffer();
        orderBySb.append("ORDER BY ?");
        for (int i = 1; i < orderFilters.size(); i++) {
            orderBySb.append(",");
            orderBySb.append("?");
        }
        return orderBySb.toString();
    }

    private String getLimitBaseSqlString(Integer limit) {
        if (limit == null) {
            return "";
        }
        return "LIMIT ?";
    }

    private String getOffsetBaseSqlString(Integer offset) {
        if (offset == null) {
            return "";
        }
        return "OFFSET ?";
    }



}
