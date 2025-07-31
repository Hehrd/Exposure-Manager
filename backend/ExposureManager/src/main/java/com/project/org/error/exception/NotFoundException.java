package com.project.org.error.exception;

import org.springframework.http.HttpStatus;

public class NotFoundException extends ExposureManagerException {
    public NotFoundException(String message) {
        super(HttpStatus.NOT_FOUND, message);
    }
}
