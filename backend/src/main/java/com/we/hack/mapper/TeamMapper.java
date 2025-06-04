package com.we.hack.mapper;

import com.we.hack.dto.TeamDto;
import com.we.hack.model.Team;
import com.we.hack.model.User;

import java.util.List;
import java.util.stream.Collectors;

public final class TeamMapper {

    private TeamMapper() {}

    public static TeamDto toDto(Team team) {
        List<Integer> userIds = team.getUsers().stream()
                .map(User::getId)
                .collect(Collectors.toList());

        return TeamDto.builder()
                .id(team.getId())
                .name(team.getName())
                .userIds(userIds)
                .hackathonId(team.getHackathon() != null ? team.getHackathon().getId() : null)
                .submissionId(team.getSubmission() != null ? team.getSubmission().getId() : null)
                .build();
    }
}