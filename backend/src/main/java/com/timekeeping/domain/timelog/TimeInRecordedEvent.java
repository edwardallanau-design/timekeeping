package com.timekeeping.domain.timelog;

import org.springframework.context.ApplicationEvent;

import java.time.LocalDateTime;

/**
 * Domain event published when a user successfully clocks in.
 */
public class TimeInRecordedEvent extends ApplicationEvent {

    private final String userId;
    private final String timeLogId;
    private final LocalDateTime timeIn;

    public TimeInRecordedEvent(Object source, String userId, String timeLogId, LocalDateTime timeIn) {
        super(source);
        this.userId    = userId;
        this.timeLogId = timeLogId;
        this.timeIn    = timeIn;
    }

    public String getUserId()        { return userId; }
    public String getTimeLogId()     { return timeLogId; }
    public LocalDateTime getTimeIn() { return timeIn; }
}
