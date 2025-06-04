package com.we.hack.model;

import com.we.hack.visitor.AnalyticsVisitor;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String username;

    @Column(unique = true)
    private String email;

    private String password;

    private String smtpPassword;

//    @Enumerated(EnumType.STRING)
//    private Role role;

    public void accept(AnalyticsVisitor visitor){
        visitor.visit(this);
    }
}
