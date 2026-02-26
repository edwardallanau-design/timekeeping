package com.timekeeping.domain.timelog;

import org.springframework.context.ApplicationEvent;

import java.time.LocalDateTime;

/**
 * Domain event published when a user successfully clocks out.
 */
public class TimeOutRecordedEvent extends ApplicationEvent {

    private final String userId;
    private final String timeLogId;
    private final LocalDateTime timeOut;
    private final double hoursWorked;
    private final AttendanceStatus status;

    public TimeOutRecordedEvent(Object source, String userId, String timeLogId,
                                LocalDateTime timeOut, double hoursWorked, AttendanceStatus status) {
        super(source);
        this.userId      = userId;
        this.timeLogId   = timeLogId;
        this.timeOut     = timeOut;
        this.hoursWorked = hoursWorked;
        this.status      = status;
    }

    public String getUserId()           { return userId; }
    public String getTimeLogId()        { return timeLogId; }
    public LocalDateTime getTimeOut()   { return timeOut; }
    public double getHoursWorked()      { return hoursWorked; }
    public AttendanceStatus getStatus() { return status; }
}
