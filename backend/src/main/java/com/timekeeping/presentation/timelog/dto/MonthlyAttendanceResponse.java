package com.timekeeping.presentation.timelog.dto;

import java.util.List;

public record MonthlyAttendanceResponse(
        boolean success,
        List<TimeLogDto> logs
) {}
