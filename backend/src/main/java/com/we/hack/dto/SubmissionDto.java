package com.we.hack.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SubmissionDto {
    private Long id;
    private String title;
    private String description;
    private Long teamId;
    private Long hackathonId;
}
