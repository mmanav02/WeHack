package com.we.hack.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Submission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private String projectUrl;

    @ManyToOne
    private User user;

    @ManyToOne
    private Hackathon hackathon;
}
