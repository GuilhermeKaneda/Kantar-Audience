package com.github.kaneda.kantaraudience.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.github.kaneda.kantaraudience.repository.AudienceRepository;
import com.github.kaneda.kantaraudience.dto.AvgByBroadcaster;
import com.github.kaneda.kantaraudience.dto.AvgMetricsPerDay;
import com.github.kaneda.kantaraudience.dto.AvgMetricsPerTimeSlot;
import com.github.kaneda.kantaraudience.dto.AvgMetricsPerWeekDay;
import com.github.kaneda.kantaraudience.model.Audience;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AudienceService {

    private final AudienceRepository repository;

    public List<Audience> findAll() {
        return repository.findAll();
    }

    public List<String> findDistinctMarket() {
        return repository.findDistinctMarket();
    }

    public List<String> findDistinctBroadcaster() {
        return repository.findDistinctBroadcaster();
    }

    public List<AvgByBroadcaster> findAvgRatingAndShareByBroadcaster(String[] broadcaster, String[] market, LocalDate startDate, LocalDate endDate) {
        return repository.findAvgRatingAndShareByBroadcaster(broadcaster, market, startDate, endDate);
    }

    public List<AvgMetricsPerDay> findAvgRatingAndSharePerDay(LocalDate startDate, LocalDate endDate, String[] broadcaster, String[] market) {
        return repository.findAvgRatingAndSharePerDay(startDate, endDate, broadcaster, market);
    }

    public List<AvgMetricsPerTimeSlot> findAvgRatingAndSharePerTimeSlot(String[] broadcaster, String[] market, LocalDate startDate, LocalDate endDate) {
        return repository.findAvgRatingAndSharePerTimeSlot(broadcaster, market, startDate, endDate);
    }

    public List<AvgMetricsPerWeekDay> findAvgRatingAndSharePerWeekDay(String[] broadcaster, String[] market, LocalDate startDate, LocalDate endDate) {
        return repository.findAvgRatingAndSharePerWeekDay(broadcaster, market, startDate, endDate);
    }
}