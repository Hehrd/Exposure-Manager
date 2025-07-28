package com.project.org.service.sql.model;

import lombok.Getter;

@Getter
public enum LogicalOperators {
    AND("AND"),
    OR("OR"),
    NOT("NOT"),
    AND_NOT("AND NOT"),
    OR_NOT("OR NOT");

    private final String value;

    private LogicalOperators(String value) {
        this.value = value;
    }

}
