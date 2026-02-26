package com.timekeeping.presentation.timelog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record DevTimeInRequest(
        @NotNull LocalDateTime dateTime,
        @NotBlank String timezone
) {
}
