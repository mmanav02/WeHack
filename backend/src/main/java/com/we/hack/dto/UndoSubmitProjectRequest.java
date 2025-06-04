package com.we.hack.dto;

import lombok.Data;

@Data
public class UndoSubmitProjectRequest {
    private Long teamId;
    private Long submissionId;
    private Long hackathonId;
}
