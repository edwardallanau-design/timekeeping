package com.timekeeping.infrastructure.persistence;

import com.timekeeping.domain.timelog.TimeLog;
import com.timekeeping.domain.timelog.TimeLogRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Adapter that bridges the domain {@link TimeLogRepository} interface
 * to Spring Data JPA.
 */
@Repository
class TimeLogRepositoryAdapter implements TimeLogRepository {

    private final SpringDataTimeLogRepository jpa;

    TimeLogRepositoryAdapter(SpringDataTimeLogRepository jpa) {
        this.jpa = jpa;
    }

    @Override
    public TimeLog save(TimeLog timeLog) {
        return jpa.save(timeLog);
    }

    @Override
    public Optional<TimeLog> findByUserIdAndDate(String userId, LocalDate date) {
        return jpa.findByUserIdAndDate(userId, date);
    }

    @Override
    public List<TimeLog> findByUserIdAndDateBetween(String userId, LocalDate startInclusive, LocalDate endExclusive) {
        return jpa.findByUserIdAndDateGreaterThanEqualAndDateLessThan(userId, startInclusive, endExclusive);
    }
}
