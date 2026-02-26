package com.timekeeping.application.auth;

/**
 * Immutable command carrying credentials for login.
 */
public record LoginCommand(
        String email,
        String password
) {}
