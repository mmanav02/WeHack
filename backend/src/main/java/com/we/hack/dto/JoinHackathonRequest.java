package com.we.hack.dto;

import com.we.hack.model.Role;
import lombok.Data;

@Data
public class JoinHackathonRequest {
    private Long userId;
    private int hackathonId;
    private Role role; // PARTICIPANT or JUDGE
}
