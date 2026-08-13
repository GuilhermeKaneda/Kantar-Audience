package com.github.kaneda.kantaraudience.dto;

public record AvgMetricsPerTarget (
    String broadcaster,
    String target,
    String targetGroup,
    Double avgRating,
    Double avgShare
) {}
