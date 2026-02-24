package com.timekeeping.api.dto;

public record TimeLogResponse(boolean success, String message, Object timeLog) {
}
