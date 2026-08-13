package com.github.kaneda.kantaraudience.model;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "mart_audience_share", schema = "public")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Audience {

    @EmbeddedId
    private AudienceId id;

    // colunas que JÁ estão no EmbeddedId precisam de insertable=false, updatable=false
    @Column(name = "broadcaster", insertable=false, updatable=false)
    private String broadcaster;

    @Column(name = "market", insertable=false, updatable=false)
    private String market;

    @Column(name = "date", insertable=false, updatable=false)
    private LocalDate date;

    @Column(name = "time_slot", insertable=false, updatable=false)
    private String timeSlot;

    @Column(name = "target", insertable=false, updatable=false)
    private String target;

    // colunas que NÃO estão no EmbeddedId ficam normais
    @Column(name = "week_day")
    private String weekDay;

    @Column(name = "week_day_number")
    private Integer weekNumber;

    @Column(name = "target_group")
    private String targetGroup;

    @Column(name = "broadcaster_rating")
    private Double broadcasterRating;

    @Column(name = "total_rating")
    private Double totalRating;

    @Column(name = "share")
    private Double share;
}
