package com.github.kaneda.kantaraudience.dto;

public record AvgMetricsPerTimeSlot (
    String broadcaster,
    String timeSlot,
    Double avgRating,
    Double avgShare
) {}
