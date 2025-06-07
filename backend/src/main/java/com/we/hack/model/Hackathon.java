package com.we.hack.model;

import com.we.hack.dto.MailModes;
import com.we.hack.service.visitor.AnalyticsVisitor;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

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
    private Instant startDate; // You can later change it to LocalDateTime if needed
    private Instant endDate;
    private String status; // Example values: "Draft", "Published", etc.
    @Getter
    @Setter
    @Column(name = "slack_enabled", nullable = false)
    private boolean slackEnabled;

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
