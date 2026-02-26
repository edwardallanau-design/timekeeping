package com.timekeeping.application.timelog;

import com.timekeeping.domain.timelog.AttendanceStatus;
import com.timekeeping.domain.timelog.TimeLog;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Read-model for a single TimeLog entry returned to the presentation layer.
 */
public record TimeLogResult(
        String id,
        String userId,
        LocalDate date,
        LocalDateTime timeIn,
        LocalDateTime timeOut,
        double hoursWorked,
        AttendanceStatus status,
        String notes
) {
    public static TimeLogResult from(TimeLog timeLog) {
        return new TimeLogResult(
                timeLog.getId(),
                timeLog.getUserId(),
                timeLog.getDate(),
                timeLog.getTimeIn(),
                timeLog.getTimeOut(),
                timeLog.getHoursWorked(),
                timeLog.getStatus(),
                timeLog.getNotes()
        );
    }
}
