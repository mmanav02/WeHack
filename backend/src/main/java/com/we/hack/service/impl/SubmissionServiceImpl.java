package com.we.hack.service.impl;

import com.we.hack.model.Hackathon;
import com.we.hack.model.Submission;
import com.we.hack.model.User;
import com.we.hack.repository.HackathonRepository;
import com.we.hack.repository.SubmissionRepository;
import com.we.hack.repository.UserRepository;
import com.we.hack.service.SubmissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class SubmissionServiceImpl implements SubmissionService {

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HackathonRepository hackathonRepository;

    @Override
    public Submission saveSubmission(Long userId, int hackathonId, Submission submission) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Hackathon hackathon = hackathonRepository.findById(hackathonId)
                .orElseThrow(() -> new RuntimeException("Hackathon not found"));

        submission.setUser(user);
        submission.setHackathon(hackathon);

        return submissionRepository.save(submission);
    }

    @Override
    public Submission validateSubmission(Long userId, int hackathonId, Submission submission, MultipartFile file) {
        // Not responsible for validation, so just return back
        // validation implemented by proxy
        return submission;
    }

}
