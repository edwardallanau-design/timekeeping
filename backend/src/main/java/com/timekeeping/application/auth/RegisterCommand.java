package com.timekeeping.application.auth;

/**
 * Immutable command carrying all data needed to register a new user.
 */
public record RegisterCommand(
        String name,
        String email,
        String password,
        String department
) {}
