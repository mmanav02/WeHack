package com.we.hack.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeaveHackathonRequest {
    private Long userId;
    private int hackathonId;
}
