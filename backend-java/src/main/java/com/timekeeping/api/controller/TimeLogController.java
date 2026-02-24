package com.timekeeping.api.controller;

import com.timekeeping.api.dto.ErrorResponse;
import com.timekeeping.api.dto.TimeLogResponse;
import com.timekeeping.api.dto.YearlyStatsResponse;
import com.timekeeping.api.security.UserPrincipal;
import com.timekeeping.api.service.TimeLogService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/timelog")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class TimeLogController {

    private final TimeLogService timeLogService;

    public TimeLogController(TimeLogService timeLogService) {
        this.timeLogService = timeLogService;
    }

    @PostMapping("/time-in")
    public ResponseEntity<?> timeIn() {
        try {
            var userId = getAuthenticatedUserId();
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ErrorResponse(false, "Not authorized to access this route"));
            }

            var timeLog = timeLogService.timeIn(userId);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new TimeLogResponse(true, "Time in recorded", timeLog));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(false, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/time-out")
    public ResponseEntity<?> timeOut() {
        try {
            var userId = getAuthenticatedUserId();
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ErrorResponse(false, "Not authorized to access this route"));
            }

            var timeLog = timeLogService.timeOut(userId);
            return ResponseEntity.ok(new TimeLogResponse(true, "Time out recorded", timeLog));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(false, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/daily")
    public ResponseEntity<?> getDailyLog(@RequestParam(required = false) String date) {
        try {
            var userId = getAuthenticatedUserId();
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ErrorResponse(false, "Not authorized to access this route"));
            }

            var timeLog = timeLogService.getDailyLog(userId, date);

            // HashMap used to support null timeLog value
            var response = new HashMap<String, Object>();
            response.put("success", true);
            response.put("timeLog", timeLog);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/monthly")
    public ResponseEntity<?> getMonthlyAttendance(@RequestParam int year, @RequestParam int month) {
        try {
            var userId = getAuthenticatedUserId();
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ErrorResponse(false, "Not authorized to access this route"));
            }

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "logs", timeLogService.getMonthlyAttendance(userId, year, month)
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/yearly")
    public ResponseEntity<?> getYearlyStats(@RequestParam int year) {
        try {
            var userId = getAuthenticatedUserId();
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ErrorResponse(false, "Not authorized to access this route"));
            }

            var stats = timeLogService.getYearlyStats(userId, year);
            return ResponseEntity.ok(new YearlyStatsResponse(
                    true,
                    new YearlyStatsResponse.StatsData(
                            stats.totalHours(), stats.presentDays(), stats.absentDays(), stats.workingDays()
                    )
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(false, e.getMessage()));
        }
    }

    private String getAuthenticatedUserId() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal userPrincipal) {
            return userPrincipal.getId();
        }
        return null;
    }
}
