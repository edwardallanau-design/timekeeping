package com.timekeeping.presentation.timelog.dto;

import com.timekeeping.application.timelog.TimeLogResult;
import com.timekeeping.domain.timelog.AttendanceStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record TimeLogDto(
        String id,
        String userId,
        LocalDate date,
        LocalDateTime timeIn,
        LocalDateTime timeOut,
        double hoursWorked,
        AttendanceStatus status,
        String notes
) {
    public static TimeLogDto from(TimeLogResult result) {
        return new TimeLogDto(
                result.id(),
                result.userId(),
                result.date(),
                result.timeIn(),
                result.timeOut(),
                result.hoursWorked(),
                result.status(),
                result.notes()
        );
    }
}
