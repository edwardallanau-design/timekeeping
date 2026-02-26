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
        log.status     = AttendanceStatus.ABSENT;
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
    public LocalDateTime getCreatedAt(){ return createdAt; }
}
