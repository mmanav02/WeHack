package com.we.hack.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import com.we.hack.service.memento.SubmissionMemento;
import com.we.hack.service.visitor.AnalyticsVisitor;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIdentityInfo(
        generator = ObjectIdGenerators.PropertyGenerator.class,
        property = "id")
@Table(name="submission")
public class Submission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private String projectUrl;

    private String filePath;

    @Column(name = "is_primary")
    private Boolean isPrimary = false;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "team_id")
    @JsonBackReference
    private Team team;

    @ManyToOne
    @JoinColumn(name = "hackathon_id")
    private Hackathon hackathon;

    private Instant submitTime;

    @Transient
    public SubmissionMemento createMemento() {
        return new SubmissionMemento(
                id, title, description, projectUrl, filePath, Instant.now());
    }

    public void restore(SubmissionMemento m) {
        // keep id / relations untouched; roll back only mutable fields
        this.title       = m.getTitle();
        this.description = m.getDescription();
        this.projectUrl  = m.getProjectUrl();
        this.filePath    = m.getFilePath();
    }

    public void accept(AnalyticsVisitor visitor){
        visitor.visit(this);
    }

    /**
     * Helper method to safely get isPrimary as primitive boolean
     * @return true if isPrimary is Boolean.TRUE, false otherwise (including null)
     */
    public boolean isPrimarySubmission() {
        return Boolean.TRUE.equals(isPrimary);
    }

    /**
     * Helper method to safely set isPrimary 
     */
    public void setPrimary(boolean primary) {
        this.isPrimary = primary;
    }
}
