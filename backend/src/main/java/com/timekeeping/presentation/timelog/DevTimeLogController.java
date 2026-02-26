package com.timekeeping.presentation.timelog;

import com.timekeeping.application.timelog.TimeLogResult;
import com.timekeeping.application.timelog.TimeLogService;
import com.timekeeping.infrastructure.security.UserPrincipal;
import com.timekeeping.presentation.timelog.dto.DevTimeInRequest;
import com.timekeeping.presentation.timelog.dto.TimeLogDto;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Developer-exclusive endpoints for testing time-in/out with custom datetimes and timezones.
 */
@RestController
@RequestMapping("/api/dev/timelog")
@PreAuthorize("hasRole('DEVELOPER')")
public class DevTimeLogController {

    private final TimeLogService timeLogService;

    DevTimeLogController(TimeLogService timeLogService) {
        this.timeLogService = timeLogService;
    }

    @PostMapping("/time-in")
    public ResponseEntity<TimeLogDto> timeIn(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody DevTimeInRequest request) {
        TimeLogResult result = timeLogService.timeInCustom(
                principal.getId(), request.dateTime(), request.timezone());
        return ResponseEntity.status(HttpStatus.CREATED).body(TimeLogDto.from(result));
    }

    @PostMapping("/time-out")
    public ResponseEntity<TimeLogDto> timeOut(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody DevTimeInRequest request) {
        TimeLogResult result = timeLogService.timeOutCustom(
                principal.getId(), request.dateTime(), request.timezone());
        return ResponseEntity.status(HttpStatus.CREATED).body(TimeLogDto.from(result));
    }
}
