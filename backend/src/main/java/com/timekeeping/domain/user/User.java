package com.timekeeping.domain.user;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String department;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    protected User() {
    }

    public User(String name, String email, String encodedPassword, String department) {
        this.name       = name;
        this.email      = email;
        this.password   = encodedPassword;
        this.department = department != null ? department : "General";
        this.createdAt  = LocalDateTime.now();
    }

    public String getId()           { return id; }
    public String getName()         { return name; }
    public String getEmail()        { return email; }
    public String getPassword()     { return password; }
    public String getDepartment()   { return department; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
