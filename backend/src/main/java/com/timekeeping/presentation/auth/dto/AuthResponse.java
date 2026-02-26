package com.timekeeping.presentation.auth.dto;

import com.timekeeping.application.auth.AuthResult;

public record AuthResponse(
        boolean success,
        String token,
        UserDto user
) {
    public static AuthResponse from(AuthResult result) {
        return new AuthResponse(true, result.token(), UserDto.from(result.user()));
    }

    public static AuthResponse userOnly(UserDto user) {
        return new AuthResponse(true, null, user);
    }
}
