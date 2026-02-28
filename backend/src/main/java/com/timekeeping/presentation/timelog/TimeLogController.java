package com.timekeeping.presentation.timelog;

import com.timekeeping.application.timelog.TimeLogService;
import com.timekeeping.infrastructure.security.UserPrincipal;
import com.timekeeping.presentation.timelog.dto.AttendanceLogDto;
import com.timekeeping.presentation.timelog.dto.DailyLogResponse;
import com.timekeeping.presentation.timelog.dto.MonthlyAttendanceResponse;
import com.timekeeping.presentation.timelog.dto.TimeLogDto;
import com.timekeeping.presentation.timelog.dto.YearlyStatsResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

/**
 * Time-log endpoints. All business logic is delegated to {@link TimeLogService}.
 * This controller handles only HTTP concerns and response shaping.
 */
@RestController
@RequestMapping("/api/timelog")
public class TimeLogController {

    private final TimeLogService timeLogService;

    public TimeLogController(TimeLogService timeLogService) {
        this.timeLogService = timeLogService;
    }

    @PostMapping("/time-in")
    public ResponseEntity<TimeLogDto> timeIn(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody(required = false) Map<String, String> body) {
        String timezone = body != null ? body.get("timezone") : null;
        String dateTime = body != null ? body.get("dateTime") : null;
        var result = timeLogService.timeIn(principal.getId(), dateTime, timezone);
        return ResponseEntity.status(HttpStatus.CREATED).body(TimeLogDto.from(result));
    }

    @PostMapping("/time-out")
    public ResponseEntity<TimeLogDto> timeOut(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody(required = false) Map<String, String> body) {
        String timezone = body != null ? body.get("timezone") : null;
        String dateTime = body != null ? body.get("dateTime") : null;
        var result = timeLogService.timeOut(principal.getId(), dateTime, timezone);
        return ResponseEntity.ok(TimeLogDto.from(result));
    }

    @GetMapping("/daily")
    public ResponseEntity<DailyLogResponse> getDailyLog(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String date) {
        var result = timeLogService.getDailyLog(principal.getId(), date);
        return ResponseEntity.ok(new DailyLogResponse(true, result.map(TimeLogDto::from).orElse(null)));
    }

    @GetMapping("/monthly")
    public ResponseEntity<MonthlyAttendanceResponse> getMonthlyAttendance(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam int year,
            @RequestParam int month) {
        var logs = timeLogService.getMonthlyAttendance(principal.getId(), year, month)
                .stream()
                .map(AttendanceLogDto::from)
                .toList();
        return ResponseEntity.ok(new MonthlyAttendanceResponse(true, logs));
    }

    @GetMapping("/yearly")
    public ResponseEntity<YearlyStatsResponse> getYearlyStats(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam int year) {
        var stats = timeLogService.getYearlyStats(principal.getId(), year);
        return ResponseEntity.ok(YearlyStatsResponse.from(stats));
    }
}
