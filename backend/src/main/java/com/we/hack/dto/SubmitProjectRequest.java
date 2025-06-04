package com.we.hack.dto;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class SubmitProjectRequest {
    int hackathonId;
    Long userId;
    String title;
    String description;
    String projectUrl;
    MultipartFile file;
}
