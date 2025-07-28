package com.project.org.service.sql.model;

public class OrderFilter {
    private String column;
    private OrderTypes order;

    @Override
    public String toString() {
        return String.format("%s %s", column, order);
    }
}
