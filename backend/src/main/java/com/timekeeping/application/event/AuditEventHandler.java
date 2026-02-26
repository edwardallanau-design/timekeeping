package com.timekeeping.application.event;

import com.timekeeping.domain.timelog.TimeInRecordedEvent;
import com.timekeeping.domain.timelog.TimeOutRecordedEvent;
import com.timekeeping.domain.user.UserRegisteredEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * Audit handler that reacts to domain events asynchronously.
 *
 * Open/Closed in action: new side-effects (emails, analytics, webhooks)
 * are added as new handler classes — this class and the services that
 * publish events remain untouched.
 */
@Component
public class AuditEventHandler {

    private static final Logger log = LoggerFactory.getLogger(AuditEventHandler.class);

    @Async
    @EventListener
    public void onUserRegistered(UserRegisteredEvent event) {
        log.info("[AUDIT] User registered | id={} email={} name={}",
                event.getUserId(), event.getEmail(), event.getName());
    }

    @Async
    @EventListener
    public void onTimeIn(TimeInRecordedEvent event) {
        log.info("[AUDIT] Time-in recorded | userId={} timeLogId={} at={}",
                event.getUserId(), event.getTimeLogId(), event.getTimeIn());
    }

    @Async
    @EventListener
    public void onTimeOut(TimeOutRecordedEvent event) {
        log.info("[AUDIT] Time-out recorded | userId={} timeLogId={} hours={} status={}",
                event.getUserId(), event.getTimeLogId(),
                event.getHoursWorked(), event.getStatus());
    }
}
