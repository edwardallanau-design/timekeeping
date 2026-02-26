package com.timekeeping.shared.exception;

import org.springframework.http.HttpStatus;

/**
 * Base exception for all application-level errors.
 * Subclasses map to specific HTTP status codes, making the
 * GlobalExceptionHandler simple and exhaustive.
 */
public abstract class AppException extends RuntimeException {

    private final HttpStatus status;

    protected AppException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
