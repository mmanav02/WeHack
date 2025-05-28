package com.we.hack.service;

import com.we.hack.model.Submission;

public interface SubmissionService {
    Submission submitProject(Long userId, int hackathonId, Submission submission);
}
