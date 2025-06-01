package com.we.hack.dto;

import lombok.Data;

@Data
public class JudgeScoreRequest {
    private Long judgeId;
    private Long submissionId;
    private int innovation;
    private int impact;
    private int execution;
}
