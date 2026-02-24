package com.timekeeping.api.service;

import com.timekeeping.api.entity.TimeLog;
import com.timekeeping.api.repository.TimeLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;

@Service
public class TimeLogService {

    @Autowired
    private TimeLogRepository timeLogRepository;

    public TimeLog timeIn(String userId) {
        LocalDate today = LocalDate.now();
        
        Optional<TimeLog> existingLog = timeLogRepository.findByUserIdAndDate(userId, today);
        if (existingLog.isPresent() && existingLog.get().getTimeIn() != null) {
            throw new RuntimeException("Already timed in today");
        }

        TimeLog timeLog = new TimeLog(userId, today, LocalDateTime.now());
        return timeLogRepository.save(timeLog);
    }

    public TimeLog timeOut(String userId) {
        LocalDate today = LocalDate.now();
        
        Optional<TimeLog> logOptional = timeLogRepository.findByUserIdAndDate(userId, today);
        if (logOptional.isEmpty()) {
            throw new RuntimeException("No time in record found for today");
        }

        TimeLog timeLog = logOptional.get();
        if (timeLog.getTimeOut() != null) {
            throw new RuntimeException("Already timed out today");
        }

        timeLog.setTimeOut(LocalDateTime.now());
        timeLog.calculateHours();
        return timeLogRepository.save(timeLog);
    }

    public TimeLog getDailyLog(String userId, String date) {
        LocalDate logDate = date != null ? LocalDate.parse(date) : LocalDate.now();
        return timeLogRepository.findByUserIdAndDate(userId, logDate).orElse(null);
    }

    public List<TimeLog> getMonthlyAttendance(String userId, int year, int month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.plusMonths(1);
        
        return timeLogRepository.findByUserIdAndDateRange(userId, startDate, endDate);
    }

    public TimeLogStats getYearlyStats(String userId, int year) {
        LocalDate startDate = LocalDate.of(year, 1, 1);
        LocalDate endDate = LocalDate.of(year + 1, 1, 1);

        List<TimeLog> logs = timeLogRepository.findByUserIdAndDateRange(userId, startDate, endDate);

        double totalHours = logs.stream()
                .mapToDouble(log -> log.getHoursWorked() != null ? log.getHoursWorked() : 0)
                .sum();

        long presentDays = logs.stream().filter(log -> "present".equals(log.getStatus())).count();
        long absentDays = logs.stream().filter(log -> "absent".equals(log.getStatus())).count();

        return new TimeLogStats(totalHours, presentDays, absentDays, logs.size());
    }

    public static class TimeLogStats {
        public double totalHours;
        public long presentDays;
        public long absentDays;
        public long workingDays;

        public TimeLogStats(double totalHours, long presentDays, long absentDays, long workingDays) {
            this.totalHours = totalHours;
            this.presentDays = presentDays;
            this.absentDays = absentDays;
            this.workingDays = workingDays;
        }

        public double getTotalHours() {
            return totalHours;
        }

        public long getPresentDays() {
            return presentDays;
        }

        public long getAbsentDays() {
            return absentDays;
        }

        public long getWorkingDays() {
            return workingDays;
        }
    }
}
