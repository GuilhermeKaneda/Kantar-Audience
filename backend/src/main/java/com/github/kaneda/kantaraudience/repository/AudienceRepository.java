package com.github.kaneda.kantaraudience.repository;

import com.github.kaneda.kantaraudience.dto.AvgByBroadcaster;
import com.github.kaneda.kantaraudience.dto.AvgMetricsPerDay;
import com.github.kaneda.kantaraudience.dto.AvgMetricsPerTimeSlot;
import com.github.kaneda.kantaraudience.dto.AvgMetricsPerWeekDay;
import com.github.kaneda.kantaraudience.model.Audience;
import com.github.kaneda.kantaraudience.model.AudienceId;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface AudienceRepository extends JpaRepository<Audience, AudienceId> {
    
    List<Audience> findByDateBetween(LocalDate startDate, LocalDate endDate);

    @Query("SELECT DISTINCT a.market FROM Audience a")
    List<String> findDistinctMarket();

    @Query("SELECT DISTINCT a.broadcaster FROM Audience a")
    List<String> findDistinctBroadcaster();

    @Query("SELECT DISTINCT a.weekDay FROM Audience a")
    List<String> findDistinctWeekDay();

    @Query("""
        SELECT a.broadcaster, AVG(a.broadcasterRating), SUM(a.broadcasterRating) / SUM(a.totalRating) * 100
        FROM Audience a
        WHERE a.date BETWEEN :startDate AND :endDate
        AND (:broadcaster IS NULL OR a.broadcaster IN :broadcaster)
        AND (:market IS NULL OR a.market IN :market)
        GROUP BY a.broadcaster
    """)
    List<AvgByBroadcaster> findAvgRatingAndShareByBroadcaster(String[] broadcaster, String[] market, LocalDate startDate, LocalDate endDate);

    @Query("""
        SELECT a.broadcaster, a.date, AVG(a.broadcasterRating), SUM(a.broadcasterRating) / SUM(a.totalRating) * 100
        FROM Audience a
        WHERE a.date BETWEEN :startDate AND :endDate
        AND (:broadcaster IS NULL OR a.broadcaster IN :broadcaster)
        AND (:market IS NULL OR a.market IN :market)
        GROUP BY a.broadcaster, a.date
        ORDER BY a.date
    """)
    List<AvgMetricsPerDay> findAvgRatingAndSharePerDay(LocalDate startDate, LocalDate endDate, String[] broadcaster, String[] market);

    @Query("""
        SELECT a.broadcaster, a.timeSlot, AVG(a.broadcasterRating), SUM(a.broadcasterRating) / SUM(a.totalRating) * 100
        FROM Audience a
        WHERE a.date BETWEEN :startDate AND :endDate
        AND (:broadcaster IS NULL OR a.broadcaster IN :broadcaster)
        AND (:market IS NULL OR a.market IN :market)
        GROUP BY a.timeSlot, a.broadcaster
        ORDER BY a.timeSlot
    """)
    List<AvgMetricsPerTimeSlot> findAvgRatingAndSharePerTimeSlot(String[] broadcaster, String[] market, LocalDate startDate, LocalDate endDate);

    @Query("""
        SELECT a.broadcaster, a.weekDay, AVG(a.broadcasterRating), SUM(a.broadcasterRating) / SUM(a.totalRating) * 100
        FROM Audience a
        WHERE a.date BETWEEN :startDate AND :endDate
        AND (:broadcaster IS NULL OR a.broadcaster IN :broadcaster)
        AND (:market IS NULL OR a.market IN :market)
        AND (:weekDay IS NULL OR a.weekDay IN :weekDay)
        GROUP BY a.weekDay, a.broadcaster
    """)
    List<AvgMetricsPerWeekDay> findAvgRatingAndSharePerWeekDay(String[] broadcaster, String[] market, String[] weekDay, LocalDate startDate, LocalDate endDate);
}
