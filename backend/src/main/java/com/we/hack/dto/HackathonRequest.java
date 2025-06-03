package com.we.hack.dto;

import com.we.hack.model.ScoringMethod;
import lombok.Data;

@Data
public class HackathonRequest {
    private String title;
    private String description;
    private String date;
    private long userId;
    private ScoringMethod scoringMethod;
    private String smtpPassword;
}
