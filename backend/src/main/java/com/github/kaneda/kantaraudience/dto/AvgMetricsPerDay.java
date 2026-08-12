package com.github.kaneda.kantaraudience.dto;

import java.time.LocalDate;

public record AvgMetricsPerDay (
    String broadcaster,
    LocalDate date,
    Double avgRating,
    Double avgShare
) {}
