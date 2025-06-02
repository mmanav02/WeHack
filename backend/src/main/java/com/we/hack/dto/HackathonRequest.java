package com.we.hack.dto;

import com.we.hack.model.ScoringMethod;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HackathonRequest {
    private Long userId;
    private String title;
    private String description;
    private String date;
    private ScoringMethod scoringMethod;
}
