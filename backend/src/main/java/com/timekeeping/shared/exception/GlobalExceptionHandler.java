package com.timekeeping.shared.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Central error handler for all controllers. Returns a consistent
 * JSON error envelope so clients never receive raw Spring error pages.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /** Handles all domain AppException subclasses (404, 409, 422, etc.) */
    @ExceptionHandler(AppException.class)
    public ResponseEntity<ErrorEnvelope> handleAppException(AppException ex) {
        log.warn("Application exception [{}]: {}", ex.getStatus(), ex.getMessage());
        return ResponseEntity
                .status(ex.getStatus())
                .body(new ErrorEnvelope(ex.getStatus().value(), ex.getMessage()));
    }

    /** Handles @Valid / @Validated bean validation failures */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ValidationErrorEnvelope> handleValidation(MethodArgumentNotValidException ex) {
        var fieldErrors = ex.getBindingResult().getFieldErrors().stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        fe -> fe.getDefaultMessage() != null ? fe.getDefaultMessage() : "Invalid value",
                        (a, b) -> a
                ));
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ValidationErrorEnvelope(400, "Validation failed", fieldErrors));
    }

    /** Spring Security bad credentials */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorEnvelope> handleBadCredentials(BadCredentialsException ex) {
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorEnvelope(401, "Invalid credentials"));
    }

    /** Catch-all for unexpected errors */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorEnvelope> handleGeneric(Exception ex) {
        log.error("Unexpected error", ex);
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorEnvelope(500, "An unexpected error occurred"));
    }

    // ── Response shapes ───────────────────────────────────────────────────

    public record ErrorEnvelope(
            int status,
            String message,
            Instant timestamp
    ) {
        ErrorEnvelope(int status, String message) {
            this(status, message, Instant.now());
        }
    }

    public record ValidationErrorEnvelope(
            int status,
            String message,
            Map<String, String> errors,
            Instant timestamp
    ) {
        ValidationErrorEnvelope(int status, String message, Map<String, String> errors) {
            this(status, message, errors, Instant.now());
        }
    }
}
