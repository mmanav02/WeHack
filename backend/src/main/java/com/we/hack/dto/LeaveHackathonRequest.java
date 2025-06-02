package com.we.hack.dto;

import lombok.Data;

@Data
public class LeaveHackathonRequest {
    private long userId;
    private long hackathonId;
}
