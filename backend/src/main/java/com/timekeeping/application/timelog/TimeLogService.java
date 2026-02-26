package com.timekeeping.application.timelog;

import java.util.List;
import java.util.Optional;

/**
 * Port defining all time-log use-cases.
 */
public interface TimeLogService {

    TimeLogResult timeIn(String userId);

    TimeLogResult timeOut(String userId);

    Optional<TimeLogResult> getDailyLog(String userId, String date);

    List<TimeLogResult> getMonthlyAttendance(String userId, int year, int month);

    AttendanceStatsResult getYearlyStats(String userId, int year);
}
