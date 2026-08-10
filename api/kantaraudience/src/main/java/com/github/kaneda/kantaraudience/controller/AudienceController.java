package com.github.kaneda.kantaraudience.controller;

import com.github.kaneda.kantaraudience.dto.AvgByBroadcaster;
import com.github.kaneda.kantaraudience.dto.AvgMetricsPerDay;
import com.github.kaneda.kantaraudience.dto.AvgMetricsPerTimeSlot;
import com.github.kaneda.kantaraudience.dto.AvgMetricsPerWeekDay;
import com.github.kaneda.kantaraudience.model.Audience;
import com.github.kaneda.kantaraudience.service.AudienceService;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

import lombok.RequiredArgsConstructor;


@RestController
@RequestMapping("/api/audience")
@RequiredArgsConstructor
public class AudienceController {

    private final AudienceService service;

    // GET /api/audience
    @GetMapping
    public ResponseEntity<List<Audience>> findAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/market")
    public ResponseEntity<List<String>> findDistinctMarket() {
        return ResponseEntity.ok(service.findDistinctMarket());
    }

    @GetMapping("/broadcaster")
    public ResponseEntity<List<String>> findDistinctBroadcaster() {
        return ResponseEntity.ok(service.findDistinctBroadcaster());
    }  

    @GetMapping("avgratingandshare")
    public ResponseEntity<List<AvgByBroadcaster>> findAvgRatingAndShareByBroadcaster(
        @RequestParam(required = false) String[] broadcaster,
        @RequestParam(required = false) String[] market,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        return ResponseEntity.ok(service.findAvgRatingAndShareByBroadcaster(broadcaster, market, startDate, endDate));
    }

    // GET /api/audience/avgratingandshareperday?broadcaster=Globo&startDate=2023-01-01&endDate=2023-01-31
    // Formato ISO = yyyy-MM-dd
    @GetMapping("avgratingandshareperday")
    public ResponseEntity<List<AvgMetricsPerDay>> findAvgRatingAndSharePerDay(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
        @RequestParam(required = false) String[] broadcaster,
        @RequestParam(required = false) String[] market
    ) {
        return ResponseEntity.ok(service.findAvgRatingAndSharePerDay(startDate, endDate, broadcaster, market));
    }

    @GetMapping("avgratingandsharepertimeslot")
    public ResponseEntity<List<AvgMetricsPerTimeSlot>> findAvgRatingAndSharePerTimeSlot(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
        @RequestParam(required = false) String[] broadcaster,
        @RequestParam(required = false) String[] market
    ) {
        return ResponseEntity.ok(service.findAvgRatingAndSharePerTimeSlot(broadcaster, market, startDate, endDate));
    }

    @GetMapping("avgratingandshareperweekday")
    public ResponseEntity<List<AvgMetricsPerWeekDay>> findAvgRatingAndSharePerWeekDay(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
        @RequestParam(required = false) String[] broadcaster,
        @RequestParam(required = false) String[] market
    ) {
        return ResponseEntity.ok(service.findAvgRatingAndSharePerWeekDay(broadcaster, market, startDate, endDate));
    }
}