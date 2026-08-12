package com.github.kaneda.kantaraudience.config;

import java.util.concurrent.TimeUnit;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.github.benmanes.caffeine.cache.Caffeine;

@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager("distinctMarkets", "distinctBroadcasters", "distinctWeekDays", "avgRatingAndShareByBroadcaster", "avgRatingAndSharePerDay", "avgRatingAndSharePerTimeSlot", "avgRatingAndSharePerWeekDay");

        // O tamanho do cache é o número de combinacões possíveis de parâmetros para cada consulta
        cacheManager.registerCustomCache("distinctMarkets", Caffeine.newBuilder().expireAfterWrite(1, TimeUnit.DAYS).maximumSize(10).build());
        cacheManager.registerCustomCache("distinctBroadcasters", Caffeine.newBuilder().expireAfterWrite(1, TimeUnit.DAYS).maximumSize(10).build());
        cacheManager.registerCustomCache("distinctWeekDays", Caffeine.newBuilder().expireAfterWrite(1, TimeUnit.DAYS).maximumSize(10).build());

        cacheManager.registerCustomCache("avgRatingAndShareByBroadcaster", Caffeine.newBuilder().expireAfterWrite(1, TimeUnit.HOURS).maximumSize(500).build());
        cacheManager.registerCustomCache("avgRatingAndSharePerDay", Caffeine.newBuilder().expireAfterWrite(1, TimeUnit.HOURS).maximumSize(500).build());
        cacheManager.registerCustomCache("avgRatingAndSharePerTimeSlot", Caffeine.newBuilder().expireAfterWrite(1, TimeUnit.HOURS).maximumSize(500).build());
        cacheManager.registerCustomCache("avgRatingAndSharePerWeekDay", Caffeine.newBuilder().expireAfterWrite(1, TimeUnit.HOURS).maximumSize(1000).build());

        return cacheManager;
    }
}