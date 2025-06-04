package com.we.hack.dto;

import com.we.hack.model.Hackathon;
import com.we.hack.model.Team;
import lombok.Data;

@Data
public class getSubmissionRequest {
    private Team team;
    private Hackathon hackathon;
}
