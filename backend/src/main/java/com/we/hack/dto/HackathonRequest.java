package com.we.hack.dto;

import com.we.hack.model.ScoringMethod;
import lombok.Data;

import java.time.Instant;

@Data
public class HackathonRequest {
    private String title;
    private String description;
    private Instant startDate;
    private Instant endDate;
    private long userId;
    private ScoringMethod scoringMethod;
    private String smtpPassword;
    private MailModes mailMode;
    private boolean slackEnabled;
}
