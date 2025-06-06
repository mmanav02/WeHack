package com.we.hack.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class HackathonDto {
    private Long id;
    private String title;
    private String description;
    private String date;
    private String status;
    private Long organizerId;
}
