package com.we.hack.dto;

import com.we.hack.model.Hackathon;
import com.we.hack.model.User;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeamRequest {
    private Long userId;
    private String name;
    private int hackathonId;
}
