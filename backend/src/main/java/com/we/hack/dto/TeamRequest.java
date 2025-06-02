package com.we.hack.dto;

import com.we.hack.model.Hackathon;
import com.we.hack.model.User;
import lombok.Data;

@Data
public class TeamRequest {
    private String name;
    private long userId;
    private long hackathonId;
}
