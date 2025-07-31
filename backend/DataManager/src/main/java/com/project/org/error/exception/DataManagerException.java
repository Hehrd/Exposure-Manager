package com.project.org.error.exception;

import org.springframework.http.HttpStatus;

public class DataManagerException extends Exception {
    private final HttpStatus httpStatus;

    public DataManagerException(HttpStatus httpStatus, String message) {
        super(message);
        this.httpStatus = httpStatus;
    }

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }
}
