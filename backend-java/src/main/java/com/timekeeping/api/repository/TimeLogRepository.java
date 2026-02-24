package com.timekeeping.api.repository;

import com.timekeeping.api.entity.TimeLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TimeLogRepository extends JpaRepository<TimeLog, String> {

    Optional<TimeLog> findByUserIdAndDate(String userId, LocalDate date);

    @Query("SELECT t FROM TimeLog t WHERE t.userId = :userId AND t.date >= :startDate AND t.date < :endDate")
    List<TimeLog> findByUserIdAndDateRange(@Param("userId") String userId,
                                           @Param("startDate") LocalDate startDate,
                                           @Param("endDate") LocalDate endDate);
}
