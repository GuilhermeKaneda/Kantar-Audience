package com.github.kaneda.kantaraudience.dto;

public record AvgByBroadcaster(
    String broadcaster,
    Double avgRating,
    Double avgShare
) {}