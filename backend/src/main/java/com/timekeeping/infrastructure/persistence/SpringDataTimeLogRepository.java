package com.timekeeping.infrastructure.persistence;

import com.timekeeping.domain.timelog.TimeLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA interface — internal to the infrastructure layer.
 */
interface SpringDataTimeLogRepository extends JpaRepository<TimeLog, String> {

    Optional<TimeLog> findByUserIdAndDate(String userId, LocalDate date);

    List<TimeLog> findByUserIdAndDateGreaterThanEqualAndDateLessThan(
            String userId, LocalDate startInclusive, LocalDate endExclusive);
}
