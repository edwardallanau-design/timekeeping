package com.timekeeping.application.timelog;

/**
 * Aggregated attendance statistics for a given year.
 */
public record AttendanceStatsResult(
        double totalHours,
        long presentDays,
        long halfDays,
        long absentDays,
        long totalRecordedDays
) {}
