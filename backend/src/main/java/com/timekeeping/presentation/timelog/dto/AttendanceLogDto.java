package com.timekeeping.presentation.timelog.dto;

import com.timekeeping.application.timelog.TimeLogResult;
import com.timekeeping.domain.timelog.AttendanceStatus;

import java.time.LocalDate;

/**
 * Minimal attendance log for calendar/list views.
 * Only includes date, status, and hours worked (not timeIn/timeOut details).
 */
public record AttendanceLogDto(
        LocalDate date,
        AttendanceStatus status,
        double hoursWorked
) {
    public static AttendanceLogDto from(TimeLogResult result) {
        return new AttendanceLogDto(
                result.date(),
                result.status(),
                result.hoursWorked()
        );
    }
}
