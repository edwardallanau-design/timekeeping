package com.timekeeping.presentation.timelog.dto;

import com.timekeeping.application.timelog.AttendanceStatsResult;

public record YearlyStatsResponse(
        boolean success,
        Stats stats
) {
    public record Stats(
            double totalHours,
            long presentDays,
            long halfDays,
            long absentDays,
            long totalRecordedDays
    ) {}

    public static YearlyStatsResponse from(AttendanceStatsResult result) {
        return new YearlyStatsResponse(true, new Stats(
                result.totalHours(),
                result.presentDays(),
                result.halfDays(),
                result.absentDays(),
                result.totalRecordedDays()
        ));
    }
}
