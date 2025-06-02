package com.we.hack.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "hackathons")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Hackathon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String title;
    private String description;
    private String date; // You can later change it to LocalDateTime if needed

    @ManyToOne
    @JoinColumn(name = "organizer_id")
    private User organizer;

    @Enumerated(EnumType.STRING)
    private ScoringMethod scoringMethod;
}
