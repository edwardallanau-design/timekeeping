package com.timekeeping.application.auth;

/**
 * Port defining authentication use-cases.
 * High-level policy; depends only on primitives and application-layer records.
 */
public interface AuthService {

    AuthResult register(RegisterCommand command);

    AuthResult login(LoginCommand command);

    UserResult getUser(String userId);
}
