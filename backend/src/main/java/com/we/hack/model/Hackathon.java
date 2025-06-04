package com.we.hack.model;

import com.we.hack.dto.MailModes;
import com.we.hack.service.visitor.AnalyticsVisitor;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Hackathon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private String date; // You can later change it to LocalDateTime if needed
    private String status; // Example values: "Draft", "Published", etc.

    @ManyToOne
    @JoinColumn(name = "organizer_id")
    private User organizer;

    @Enumerated(EnumType.STRING)
    private ScoringMethod scoringMethod;

    @Enumerated(EnumType.STRING)
    private MailModes mailMode;

    public void accept(AnalyticsVisitor visitor){
        visitor.visit(this);
    }
}
