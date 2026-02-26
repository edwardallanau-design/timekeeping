package com.timekeeping.application.timelog;

import com.timekeeping.domain.timelog.AttendanceStatus;
import com.timekeeping.domain.timelog.TimeInRecordedEvent;
import com.timekeeping.domain.timelog.TimeLog;
import com.timekeeping.domain.timelog.TimeLogRepository;
import com.timekeeping.domain.timelog.TimeOutRecordedEvent;
import com.timekeeping.shared.exception.BusinessRuleException;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Core time-log service. Handles business rules around clocking in/out
 * and delegates side-effects (audit, notifications) to event listeners,
 * keeping this class focused solely on the time-tracking logic.
 */
@Service
@Transactional
class TimeLogServiceImpl implements TimeLogService {

    private final TimeLogRepository        timeLogRepository;
    private final ApplicationEventPublisher eventPublisher;

    TimeLogServiceImpl(TimeLogRepository timeLogRepository,
                       ApplicationEventPublisher eventPublisher) {
        this.timeLogRepository = timeLogRepository;
        this.eventPublisher    = eventPublisher;
    }

    @Override
    public TimeLogResult timeIn(String userId) {
        var today = LocalDate.now();

        timeLogRepository.findByUserIdAndDate(userId, today).ifPresent(existing -> {
            if (existing.hasTimedIn()) {
                throw new BusinessRuleException("You have already timed in today");
            }
        });

        var timeLog   = TimeLog.createTimeIn(userId, today, LocalDateTime.now());
        var savedLog  = timeLogRepository.save(timeLog);

        eventPublisher.publishEvent(
                new TimeInRecordedEvent(this, userId, savedLog.getId(), savedLog.getTimeIn()));

        return TimeLogResult.from(savedLog);
    }

    @Override
    public TimeLogResult timeOut(String userId) {
        var today   = LocalDate.now();
        var timeLog = timeLogRepository.findByUserIdAndDate(userId, today)
                .orElseThrow(() -> new BusinessRuleException("No time-in record found for today"));

        if (timeLog.hasTimedOut()) {
            throw new BusinessRuleException("You have already timed out today");
        }

        timeLog.recordTimeOut(LocalDateTime.now());
        var savedLog = timeLogRepository.save(timeLog);

        eventPublisher.publishEvent(new TimeOutRecordedEvent(
                this, userId, savedLog.getId(),
                savedLog.getTimeOut(), savedLog.getHoursWorked(), savedLog.getStatus()));

        return TimeLogResult.from(savedLog);
    }

    @Override
    public TimeLogResult timeIn(String userId, String dateTime, String timezone) {
        LocalDateTime timeInValue = dateTime != null ? LocalDateTime.parse(dateTime) : LocalDateTime.now();
        LocalDate today = timeInValue.toLocalDate();

        timeLogRepository.findByUserIdAndDate(userId, today).ifPresent(existing -> {
            if (existing.hasTimedIn()) {
                throw new BusinessRuleException("You have already timed in today");
            }
        });

        var timeLog = TimeLog.createTimeIn(userId, today, timeInValue);
        if (timezone != null) {
            timeLog.setTimezone(timezone);
        }
        var savedLog = timeLogRepository.save(timeLog);

        eventPublisher.publishEvent(
                new TimeInRecordedEvent(this, userId, savedLog.getId(), savedLog.getTimeIn()));

        return TimeLogResult.from(savedLog);
    }

    @Override
    public TimeLogResult timeOut(String userId, String dateTime, String timezone) {
        LocalDateTime timeOutValue = dateTime != null ? LocalDateTime.parse(dateTime) : LocalDateTime.now();
        LocalDate today = timeOutValue.toLocalDate();
        var timeLog = timeLogRepository.findByUserIdAndDate(userId, today)
                .orElseThrow(() -> new BusinessRuleException("No time-in record found for today"));

        if (timeLog.hasTimedOut()) {
            throw new BusinessRuleException("You have already timed out today");
        }

        timeLog.recordTimeOut(timeOutValue);
        if (timezone != null) {
            timeLog.setTimezone(timezone);
        }
        var savedLog = timeLogRepository.save(timeLog);

        eventPublisher.publishEvent(new TimeOutRecordedEvent(
                this, userId, savedLog.getId(),
                savedLog.getTimeOut(), savedLog.getHoursWorked(), savedLog.getStatus()));

        return TimeLogResult.from(savedLog);
    }

    @Override
    public TimeLogResult timeInCustom(String userId, LocalDateTime dateTime, String timezone) {
        var date = dateTime.toLocalDate();

        // Allow overwriting: if a log exists for this date, update its time-in
        var existing = timeLogRepository.findByUserIdAndDate(userId, date);
        TimeLog timeLog;

        if (existing.isPresent()) {
            // Update existing log's time-in
            timeLog = existing.get();
            timeLog.setTimeIn(dateTime);
            timeLog.setTimezone(timezone);
        } else {
            // Create new log
            timeLog = TimeLog.createTimeInAt(userId, date, dateTime, timezone);
        }

        var savedLog = timeLogRepository.save(timeLog);

        eventPublisher.publishEvent(
                new TimeInRecordedEvent(this, userId, savedLog.getId(), savedLog.getTimeIn()));

        return TimeLogResult.from(savedLog);
    }

    @Override
    public TimeLogResult timeOutCustom(String userId, LocalDateTime dateTime, String timezone) {
        var date    = dateTime.toLocalDate();
        var timeLog = timeLogRepository.findByUserIdAndDate(userId, date)
                .orElseThrow(() -> new BusinessRuleException("No time-in record found for this date"));

        // Allow overwriting: always update time-out (even if one exists)
        timeLog.recordTimeOutAt(dateTime);
        var savedLog = timeLogRepository.save(timeLog);

        eventPublisher.publishEvent(new TimeOutRecordedEvent(
                this, userId, savedLog.getId(),
                savedLog.getTimeOut(), savedLog.getHoursWorked(), savedLog.getStatus()));

        return TimeLogResult.from(savedLog);
    }

    @Override
    public void deleteTimeLog(String userId, String date) {
        var logDate = LocalDate.parse(date);
        var timeLog = timeLogRepository.findByUserIdAndDate(userId, logDate)
                .orElseThrow(() -> new BusinessRuleException("No time log found for this date"));

        timeLogRepository.delete(timeLog);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<TimeLogResult> getDailyLog(String userId, String date) {
        var logDate = date != null ? LocalDate.parse(date) : LocalDate.now();
        return timeLogRepository.findByUserIdAndDate(userId, logDate)
                .map(TimeLogResult::from);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TimeLogResult> getMonthlyAttendance(String userId, int year, int month) {
        var start = LocalDate.of(year, month, 1);
        var end   = start.plusMonths(1);
        return timeLogRepository.findByUserIdAndDateBetween(userId, start, end)
                .stream()
                .map(TimeLogResult::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AttendanceStatsResult getYearlyStats(String userId, int year) {
        var start = LocalDate.of(year, 1, 1);
        var end   = LocalDate.of(year + 1, 1, 1);
        var logs  = timeLogRepository.findByUserIdAndDateBetween(userId, start, end);

        double totalHours  = logs.stream().mapToDouble(TimeLog::getHoursWorked).sum();
        long presentDays   = logs.stream().filter(l -> l.getStatus() == AttendanceStatus.PRESENT).count();
        long halfDays      = logs.stream().filter(l -> l.getStatus() == AttendanceStatus.HALF_DAY).count();
        long absentDays    = logs.stream().filter(l -> l.getStatus() == AttendanceStatus.ABSENT).count();

        return new AttendanceStatsResult(totalHours, presentDays, halfDays, absentDays, logs.size());
    }
}
