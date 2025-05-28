package com.we.hack.dto;

import lombok.Data;

@Data
public class HackathonRequest {
    private String title;
    private String description;
    private String date;
    private long userId;
}
