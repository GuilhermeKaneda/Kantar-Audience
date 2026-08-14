package com.github.kaneda.kantaraudience.model;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.Objects;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AudienceId implements Serializable {

    @Column(name = "broadcaster")
    private String broadcaster;

    @Column(name = "market")
    private String market;

    @Column(name = "date")
    private LocalDate date;

    @Column(name = "time_slot")
    private String timeSlot;

    @Column(name = "target")
    private String target;

    // equals, hashCode e getters obrigatórios
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof AudienceId that)) return false;

        return Objects.equals(broadcaster, that.broadcaster)
                && Objects.equals(market, that.market)
                && Objects.equals(date, that.date)
                && Objects.equals(timeSlot, that.timeSlot)
                && Objects.equals(target, that.target);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(broadcaster, market, date, timeSlot, target);
    }
}