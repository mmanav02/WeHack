package com.we.hack.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import com.we.hack.service.memento.SubmissionMemento;
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
}
