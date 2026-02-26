package com.timekeeping.application.timelog;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Port defining all time-log use-cases.
 */
public interface TimeLogService {

    TimeLogResult timeIn(String userId);

    TimeLogResult timeIn(String userId, String dateTime, String timezone);

    TimeLogResult timeOut(String userId);

    TimeLogResult timeOut(String userId, String dateTime, String timezone);

    TimeLogResult timeInCustom(String userId, LocalDateTime dateTime, String timezone);

    TimeLogResult timeOutCustom(String userId, LocalDateTime dateTime, String timezone);

    void deleteTimeLog(String userId, String date);

    Optional<TimeLogResult> getDailyLog(String userId, String date);

    List<TimeLogResult> getMonthlyAttendance(String userId, int year, int month);

    AttendanceStatsResult getYearlyStats(String userId, int year);
}
