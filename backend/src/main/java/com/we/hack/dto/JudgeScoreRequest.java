package com.we.hack.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JudgeScoreRequest {
    private Long submissionId;
    private Long judgeId;
    private double innovation;
    private double impact;
    private double execution;
}
