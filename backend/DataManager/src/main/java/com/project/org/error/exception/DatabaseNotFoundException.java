package com.project.org.error.exception;

import org.springframework.http.HttpStatus;

public class DatabaseNotFoundException extends DataManagerException {

    public DatabaseNotFoundException(String message) {
        super(HttpStatus.NOT_FOUND, message);
    }
}
