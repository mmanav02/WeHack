package com.we.hack.mapper;

import com.we.hack.dto.SubmissionDto;
import com.we.hack.model.Submission;

public final class SubmissionMapper {

    private SubmissionMapper() {}

    public static SubmissionDto toDto(Submission submission) {
        return SubmissionDto.builder()
                .id(submission.getId())
                .title(submission.getTitle())
                .description(submission.getDescription())
                .teamId(submission.getTeam() != null ? submission.getTeam().getId() : null)
                .hackathonId(submission.getHackathon() != null ? submission.getHackathon().getId() : null)
                .build();
    }
}