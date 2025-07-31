package com.project.org.error.exception;

import org.springframework.http.HttpStatus;

public class ExposureManagerException extends Exception {
    private final HttpStatus httpStatus;
    public ExposureManagerException(HttpStatus httpStatus, String message) {
        super(message);
        this.httpStatus = httpStatus;
    }

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }
}
