package com.timekeeping.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class YearlyStatsResponse {
    private boolean success;
    private StatsData stats;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatsData {
        private double totalHours;
        private long presentDays;
        private long absentDays;
        private long workingDays;
    }
}
