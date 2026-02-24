package com.timekeeping.api.dto;

public record AuthResponse(boolean success, String token, UserResponse user, String message) {
}
