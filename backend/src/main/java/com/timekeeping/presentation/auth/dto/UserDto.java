package com.timekeeping.presentation.auth.dto;

import com.timekeeping.application.auth.UserResult;

public record UserDto(
        String id,
        String name,
        String email,
        String department,
        String role
) {
    public static UserDto from(UserResult result) {
        return new UserDto(result.id(), result.name(), result.email(), result.department(), result.role().name());
    }
}
