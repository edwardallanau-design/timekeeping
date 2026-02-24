package com.timekeeping.api.service;

import com.timekeeping.api.entity.TimeLog;
import com.timekeeping.api.repository.TimeLogRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class TimeLogService {

    private final TimeLogRepository timeLogRepository;

    public TimeLogService(TimeLogRepository timeLogRepository) {
        this.timeLogRepository = timeLogRepository;
    }

    public TimeLog timeIn(String userId) {
        var today = LocalDate.now();

        var existingLog = timeLogRepository.findByUserIdAndDate(userId, today);
        if (existingLog.isPresent() && existingLog.get().getTimeIn() != null) {
            throw new RuntimeException("Already timed in today");
        }

        return timeLogRepository.save(new TimeLog(userId, today, LocalDateTime.now()));
    }

    public TimeLog timeOut(String userId) {
        var today = LocalDate.now();

        var timeLog = timeLogRepository.findByUserIdAndDate(userId, today)
                .orElseThrow(() -> new RuntimeException("No time in record found for today"));

        if (timeLog.getTimeOut() != null) {
            throw new RuntimeException("Already timed out today");
        }

        timeLog.setTimeOut(LocalDateTime.now());
        timeLog.calculateHours();
        return timeLogRepository.save(timeLog);
    }

    public TimeLog getDailyLog(String userId, String date) {
        var logDate = date != null ? LocalDate.parse(date) : LocalDate.now();
        return timeLogRepository.findByUserIdAndDate(userId, logDate).orElse(null);
    }

    public List<TimeLog> getMonthlyAttendance(String userId, int year, int month) {
        var startDate = LocalDate.of(year, month, 1);
        return timeLogRepository.findByUserIdAndDateRange(userId, startDate, startDate.plusMonths(1));
    }

    public TimeLogStats getYearlyStats(String userId, int year) {
        var startDate = LocalDate.of(year, 1, 1);
        var logs = timeLogRepository.findByUserIdAndDateRange(userId, startDate, LocalDate.of(year + 1, 1, 1));

        var totalHours = logs.stream()
                .mapToDouble(log -> log.getHoursWorked() != null ? log.getHoursWorked() : 0)
                .sum();
        var presentDays = logs.stream().filter(log -> "present".equals(log.getStatus())).count();
        var absentDays = logs.stream().filter(log -> "absent".equals(log.getStatus())).count();

        return new TimeLogStats(totalHours, presentDays, absentDays, logs.size());
    }

    public record TimeLogStats(double totalHours, long presentDays, long absentDays, long workingDays) {
    }
}
