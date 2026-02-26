package com.timekeeping.domain.timelog;

/**
 * Attendance status derived from hours worked in a day.
 * Rules: <= 4h = ABSENT | < 8h = HALF_DAY | >= 8h = PRESENT
 */
public enum AttendanceStatus {
    PRESENT,
    HALF_DAY,
    ABSENT;

    public static AttendanceStatus fromHoursWorked(double hoursWorked) {
        if (hoursWorked <= 4.0)  return ABSENT;
        if (hoursWorked < 8.0)   return HALF_DAY;
        return PRESENT;
    }
}
