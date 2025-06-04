package com.we.hack.dto;

import lombok.Data;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

@Data
public class EditSubmissionRequest {
    private int hackathonId;
    private Long userId;
    private Long submissionId;
    private String title;
    private String description;
    private String projectUrl;
    private MultipartFile file;
}
