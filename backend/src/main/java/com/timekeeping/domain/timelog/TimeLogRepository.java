package com.timekeeping.domain.timelog;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Domain repository interface for TimeLog persistence.
 * Infrastructure adapters implement this contract.
 */
public interface TimeLogRepository {

    TimeLog save(TimeLog timeLog);

    void delete(TimeLog timeLog);

    Optional<TimeLog> findByUserIdAndDate(String userId, LocalDate date);

    List<TimeLog> findByUserIdAndDateBetween(String userId, LocalDate startInclusive, LocalDate endExclusive);
}
