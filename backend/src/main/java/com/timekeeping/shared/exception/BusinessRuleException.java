package com.timekeeping.shared.exception;

import org.springframework.http.HttpStatus;

/**
 * Thrown when a domain business rule is violated.
 * Examples: "Already timed in today", "No time-in record found".
 */
public class BusinessRuleException extends AppException {

    public BusinessRuleException(String message) {
        super(message, HttpStatus.UNPROCESSABLE_ENTITY);
    }
}
