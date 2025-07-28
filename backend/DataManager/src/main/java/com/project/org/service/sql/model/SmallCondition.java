package com.project.org.service.sql.model;

public class SmallCondition {
    private String leftSide;
    private String rightSide;
    private String sign;

    @Override
    public String toString() {
        return String.format("%s %s %s", leftSide, rightSide, sign);
    }
}
