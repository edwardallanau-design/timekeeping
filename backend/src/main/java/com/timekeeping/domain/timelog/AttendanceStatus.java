package com.timekeeping.domain.timelog;

/**
 * Attendance status derived from hours worked in a day.
 * Rules: >= 8h = PRESENT | 0 < hours < 8h = HALF_DAY | 0 = PRESENT (default with time-in)
 */
public enum AttendanceStatus {
    PRESENT,
    HALF_DAY,
    ABSENT;

    public static AttendanceStatus fromHoursWorked(double hoursWorked) {
        // If 0 hours (no time-out yet), default to PRESENT
        if (hoursWorked == 0.0)      return PRESENT;
        // If less than 8 hours, mark as HALF_DAY
        if (hoursWorked < 8.0)       return HALF_DAY;
        // 8 hours or more = PRESENT
        return PRESENT;
    }
}
