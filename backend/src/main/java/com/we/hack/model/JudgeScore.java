package com.we.hack.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class JudgeScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User judge;

    @ManyToOne
    private Submission submission;

    private int innovation;
    private int impact;
    private int execution;
}
