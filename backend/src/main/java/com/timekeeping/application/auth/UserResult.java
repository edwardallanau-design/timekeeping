package com.timekeeping.application.auth;

import com.timekeeping.domain.user.Role;
import com.timekeeping.domain.user.User;

/**
 * Read-model returned to presentation layer after auth operations.
 */
public record UserResult(
        String id,
        String name,
        String email,
        String department,
        Role role
) {
    public static UserResult from(User user) {
        return new UserResult(user.getId(), user.getName(), user.getEmail(), user.getDepartment(), user.getRole());
    }
}
