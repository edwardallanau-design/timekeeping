package com.timekeeping.domain.timelog;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Entity
@Table(name = "time_logs")
public class TimeLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "time_in")
    private LocalDateTime timeIn;

    @Column(name = "time_out")
    private LocalDateTime timeOut;

    @Column(name = "hours_worked", nullable = false)
    private double hoursWorked;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AttendanceStatus status;

    private String notes;

    @Column
    private String timezone;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    protected TimeLog() {
    }

    public static TimeLog createTimeIn(String userId, LocalDate date, LocalDateTime timeIn) {
        var log = new TimeLog();
        log.userId     = userId;
        log.date       = date;
        log.timeIn     = timeIn;
        log.hoursWorked = 0.0;
        log.status     = AttendanceStatus.PRESENT;
        log.createdAt  = LocalDateTime.now();
        return log;
    }

    public static TimeLog createTimeInAt(String userId, LocalDate date, LocalDateTime timeIn, String timezone) {
        var log = new TimeLog();
        log.userId     = userId;
        log.date       = date;
        log.timeIn     = timeIn;
        log.hoursWorked = 0.0;
        log.status     = AttendanceStatus.PRESENT;
        log.timezone   = timezone;
        log.createdAt  = LocalDateTime.now();
        return log;
    }

    /**
     * Records the time-out and recalculates hours worked and attendance status.
     * This method encapsulates the core business rule — callers do not need to
     * know how status is derived.
     */
    public void recordTimeOut(LocalDateTime timeOut) {
        this.timeOut = timeOut;

        long minutes    = ChronoUnit.MINUTES.between(this.timeIn, timeOut);
        double hours    = Math.round((minutes / 60.0) * 100.0) / 100.0;
        this.hoursWorked = hours;
        this.status      = AttendanceStatus.fromHoursWorked(hours);
    }

    /**
     * Records a custom time-out at a specific datetime (for developer testing).
     * Same logic as recordTimeOut() but accepts the datetime explicitly.
     */
    public void recordTimeOutAt(LocalDateTime customTimeOut) {
        recordTimeOut(customTimeOut);
    }

    /**
     * Auto-completes the day with end-of-day time-out (11:59:59 PM).
     * Used when user never explicitly timed out.
     */
    public void autoTimeOutEndOfDay() {
        if (!hasTimedIn() || hasTimedOut()) {
            return; // Only auto time-out if has time-in but no time-out
        }

        // Auto time-out at 11:59:59 PM (23:59:59) on the same day
        LocalDateTime endOfDayTimeOut = this.date.atTime(23, 59, 59);
        recordTimeOut(endOfDayTimeOut);
    }

    public boolean hasTimedIn()  { return timeIn != null; }
    public boolean hasTimedOut() { return timeOut != null; }

    public String getId()              { return id; }
    public String getUserId()          { return userId; }
    public LocalDate getDate()         { return date; }
    public LocalDateTime getTimeIn()   { return timeIn; }
    public LocalDateTime getTimeOut()  { return timeOut; }
    public double getHoursWorked()     { return hoursWorked; }
    public AttendanceStatus getStatus(){ return status; }
    public String getNotes()           { return notes; }
    public String getTimezone()        { return timezone; }
    public LocalDateTime getCreatedAt(){ return createdAt; }

    // Setters for dev mode overwrite capability
    public void setTimeIn(LocalDateTime timeIn) {
        this.timeIn = timeIn;
    }

    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }
}
