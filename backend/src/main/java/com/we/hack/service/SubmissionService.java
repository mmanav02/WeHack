package com.we.hack.service;

import com.we.hack.dto.SubmissionDto;
import com.we.hack.model.Hackathon;
import com.we.hack.model.Submission;
import com.we.hack.model.Team;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface SubmissionService {
    Submission validateSubmission(Long userId, int hackathonId, Submission submission, MultipartFile file);

    List<SubmissionDto> listSubmissions(Hackathon hackathon, Team team);

    Submission saveSubmission(Long userId, int hackathonId, Submission submission);
    Submission editSubmission(int hackathonId, Long userId, Long submissionId, String title, String description, String projectUrl, MultipartFile file);
    
    // Add method to find submissions by hackathon ID
    List<Submission> findByHackathonId(int hackathonId);
    
    // Add method to find submission by ID
    Submission findById(Long submissionId);
}
