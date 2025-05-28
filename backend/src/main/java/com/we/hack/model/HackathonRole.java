package com.we.hack.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "hackathon_roles")
public class HackathonRole {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User user;

    @ManyToOne
    private Hackathon hackathon;

    @Enumerated(EnumType.STRING)
    private Role role; // PARTICIPANT or JUDGE
}
