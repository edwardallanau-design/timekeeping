package com.timekeeping.application.auth;

/**
 * Result returned after a successful login or register operation.
 */
public record AuthResult(
        String token,
        UserResult user
) {}
