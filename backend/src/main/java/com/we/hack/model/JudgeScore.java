package com.we.hack.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "judge_scores")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class JudgeScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "submission_id")
    private Submission submission;

    @ManyToOne
    @JoinColumn(name = "judge_id")
    private User judge;

    private double innovation;
    private double impact;
    private double execution;
}
