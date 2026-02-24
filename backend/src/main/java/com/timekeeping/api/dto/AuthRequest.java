package com.timekeeping.api.dto;

public record AuthRequest(String name, String email, String password, String department) {
}
