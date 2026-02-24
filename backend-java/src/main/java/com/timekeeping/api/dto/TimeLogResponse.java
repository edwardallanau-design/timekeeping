package com.timekeeping.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TimeLogResponse {
    private boolean success;
    private String message;
    private Object timeLog;
}
