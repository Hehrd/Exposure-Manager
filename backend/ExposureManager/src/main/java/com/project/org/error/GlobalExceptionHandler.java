package com.project.org.error;

import com.project.org.error.exception.ExposureManagerException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ExposureManagerException.class)
    public ResponseEntity<String> handleExposureManagerException(ExposureManagerException e) {
        return ResponseEntity
                .status(e.getHttpStatus())
                .body(e.getMessage());
    }

}
