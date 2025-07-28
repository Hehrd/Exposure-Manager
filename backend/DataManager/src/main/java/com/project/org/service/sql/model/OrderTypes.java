package com.project.org.service.sql.model;

import lombok.Getter;

@Getter
public enum OrderTypes {
    ASCENDING("ASC"),
    DESCENDING("DESC");

    private final String value;

    private OrderTypes(String value) {
        this.value = value;
    }
}
