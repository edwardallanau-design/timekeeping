package com.timekeeping.api.dto;

public record YearlyStatsResponse(boolean success, StatsData stats) {

    public record StatsData(double totalHours, long presentDays, long absentDays, long workingDays) {
    }
}
