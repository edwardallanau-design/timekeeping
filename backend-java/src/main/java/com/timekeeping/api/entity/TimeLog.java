package com.timekeeping.api.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "timelogs")
public class TimeLog {
    
    @Id
    private String id;
    
    private String userId;
    
    private LocalDate date;
    
    private LocalDateTime timeIn;
    
    private LocalDateTime timeOut;
    
    private Double hoursWorked;
    
    private String status;
    
    private String notes;
    
    private LocalDateTime createdAt;
    
    public TimeLog(String userId, LocalDate date, LocalDateTime timeIn) {
        this.userId = userId;
        this.date = date;
        this.timeIn = timeIn;
        this.status = "present";
        this.createdAt = LocalDateTime.now();
        this.hoursWorked = 0.0;
    }
    
    public void calculateHours() {
        if (this.timeOut != null && this.timeIn != null) {
            long minutes = ChronoUnit.MINUTES.between(this.timeIn, this.timeOut);
            double hours = Math.round((minutes / 60.0) * 100.0) / 100.0;
            this.hoursWorked = hours;
            
            if (hours <= 4) {
                this.status = "absent";
            } else if (hours < 8) {
                this.status = "half-day";
            } else {
                this.status = "present";
            }
        }
    }
}
