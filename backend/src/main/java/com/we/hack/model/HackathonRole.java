package com.we.hack.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "hackathon_roles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HackathonRole {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "hackathon_id")
    private Hackathon hackathon;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Enumerated(EnumType.STRING)
    private ApprovalStatus status = ApprovalStatus.PENDING;
}
