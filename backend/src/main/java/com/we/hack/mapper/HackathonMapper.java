package com.we.hack.mapper;

import com.we.hack.dto.HackathonDto;
import com.we.hack.model.Hackathon;

public final class HackathonMapper {

    private HackathonMapper() {}

    public static HackathonDto toDto(Hackathon hackathon) {
        return HackathonDto.builder()
                .id(hackathon.getId())
                .title(hackathon.getTitle())
                .description(hackathon.getDescription())
                .date(hackathon.getDate())
                .status(hackathon.getStatus())
                .organizerId(hackathon.getOrganizer() != null ? 
                           (long) hackathon.getOrganizer().getId() : null)
                .build();
    }
}