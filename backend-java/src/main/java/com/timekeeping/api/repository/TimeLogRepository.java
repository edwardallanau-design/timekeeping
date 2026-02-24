package com.timekeeping.api.repository;

import com.timekeeping.api.entity.TimeLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TimeLogRepository extends MongoRepository<TimeLog, String> {

    Optional<TimeLog> findByUserIdAndDate(String userId, LocalDate date);

    @Query("{ 'userId': ?0, 'date': { $gte: ?1, $lt: ?2 } }")
    List<TimeLog> findByUserIdAndDateRange(String userId, LocalDate startDate, LocalDate endDate);
}
