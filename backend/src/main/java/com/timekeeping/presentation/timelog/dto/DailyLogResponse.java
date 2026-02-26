package com.timekeeping.presentation.timelog.dto;

public record DailyLogResponse(
        boolean success,
        TimeLogDto timeLog
) {}
