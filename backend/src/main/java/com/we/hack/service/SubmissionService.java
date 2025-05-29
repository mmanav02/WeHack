package com.we.hack.service;

import com.we.hack.model.Submission;
import org.springframework.web.multipart.MultipartFile;

public interface SubmissionService {
    Submission validateSubmission(Long userId, int hackathonId, Submission submission, MultipartFile file);
    Submission saveSubmission(Long userId, int hackathonId, Submission submission);
}
