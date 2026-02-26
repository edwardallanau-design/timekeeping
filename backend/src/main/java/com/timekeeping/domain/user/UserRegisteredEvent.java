package com.timekeeping.domain.user;

import org.springframework.context.ApplicationEvent;

/**
 * Domain event published when a new user successfully registers.
 * Consumers (e.g. audit handler, notification handler) listen via @EventListener.
 */
public class UserRegisteredEvent extends ApplicationEvent {

    private final String userId;
    private final String email;
    private final String name;

    public UserRegisteredEvent(Object source, String userId, String email, String name) {
        super(source);
        this.userId = userId;
        this.email  = email;
        this.name   = name;
    }

    public String getUserId() { return userId; }
    public String getEmail()  { return email; }
    public String getName()   { return name; }
}
