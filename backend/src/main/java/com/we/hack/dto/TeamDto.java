package com.we.hack.dto;


import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class TeamDto {
    private Long id;
    private String name;
    private List<Integer> userIds;
    private Long hackathonId;
    private Long submissionId;
}
