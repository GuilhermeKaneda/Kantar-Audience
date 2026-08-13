package com.github.kaneda.kantaraudience.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.github.kaneda.kantaraudience.repository.AudienceRepository;
import com.github.kaneda.kantaraudience.dto.AvgByBroadcaster;
import com.github.kaneda.kantaraudience.dto.AvgMetricsPerDay;
import com.github.kaneda.kantaraudience.dto.AvgMetricsPerTarget;
import com.github.kaneda.kantaraudience.dto.AvgMetricsPerTimeSlot;
import com.github.kaneda.kantaraudience.dto.AvgMetricsPerWeekDay;
import com.github.kaneda.kantaraudience.model.Audience;
import org.springframework.cache.annotation.Cacheable;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AudienceService {

    private final AudienceRepository repository;

    public List<Audience> findAll() {
        return repository.findAll();
    }

    @Cacheable("distinctMarkets")
    public List<String> findDistinctMarket() {
        return repository.findDistinctMarket();
    }
 
    @Cacheable("distinctBroadcasters")
    public List<String> findDistinctBroadcaster() {
        return repository.findDistinctBroadcaster();
    }
 
    @Cacheable("distinctWeekDays")
    public List<String> findDistinctWeekDay() {
        return repository.findDistinctWeekDay();
    }
 
    @Cacheable("avgRatingAndShareByBroadcaster")
    public List<AvgByBroadcaster> findAvgRatingAndShareByBroadcaster(String[] broadcaster, String[] market, LocalDate startDate, LocalDate endDate) {
        return repository.findAvgRatingAndShareByBroadcaster(broadcaster, market, startDate, endDate);
    }
 
    @Cacheable("avgRatingAndSharePerDay")
    public List<AvgMetricsPerDay> findAvgRatingAndSharePerDay(LocalDate startDate, LocalDate endDate, String[] broadcaster, String[] market) {
        return repository.findAvgRatingAndSharePerDay(startDate, endDate, broadcaster, market);
    }
 
    @Cacheable("avgRatingAndSharePerTimeSlot")
    public List<AvgMetricsPerTimeSlot> findAvgRatingAndSharePerTimeSlot(String[] broadcaster, String[] market, LocalDate startDate, LocalDate endDate) {
        return repository.findAvgRatingAndSharePerTimeSlot(broadcaster, market, startDate, endDate);
    }
 
    @Cacheable("avgRatingAndSharePerWeekDay")
    public List<AvgMetricsPerWeekDay> findAvgRatingAndSharePerWeekDay(String[] broadcaster, String[] market, String[] weekDay, LocalDate startDate, LocalDate endDate) {
        return repository.findAvgRatingAndSharePerWeekDay(broadcaster, market, weekDay, startDate, endDate);
    }

    @Cacheable("avgRatingAndSharePerTarget")
    public List<AvgMetricsPerTarget> findAvgRatingAndSharePerTarget(String[] broadcaster, String[] market, LocalDate startDate, LocalDate endDate) {
        return repository.findAvgRatingAndSharePerTarget(broadcaster, market, startDate, endDate);
    }
}