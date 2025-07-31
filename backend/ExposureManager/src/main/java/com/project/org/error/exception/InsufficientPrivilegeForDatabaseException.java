package com.project.org.error.exception;

import org.springframework.http.HttpStatus;

public class InsufficientPrivilegeForDatabaseException extends ExposureManagerException {

    public InsufficientPrivilegeForDatabaseException(String message) {
        super(HttpStatus.FORBIDDEN, message);
    }
}
