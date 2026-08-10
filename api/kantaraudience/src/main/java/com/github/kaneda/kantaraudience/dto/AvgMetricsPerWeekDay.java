package com.github.kaneda.kantaraudience.dto;

public record AvgMetricsPerWeekDay (
    String broadcaster,
    String weekDay,
    Double avgRating,
    Double avgShare
) {}