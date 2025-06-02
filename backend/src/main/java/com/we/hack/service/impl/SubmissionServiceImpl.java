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

import java.io.File;
import java.io.IOException;

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

    @Override
    public Submission editSubmission(int hackathonId, Long userId, Long submissionId, String title, String description, String projectUrl, MultipartFile file) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        // Optional: Validate that submission belongs to user and hackathon
        if (submission.getUser().getId() != userId || submission.getHackathon().getId() != hackathonId) {
            throw new RuntimeException("Unauthorized edit attempt");
        }

        submission.setTitle(title);
        submission.setDescription(description);
        submission.setProjectUrl(projectUrl);

        if (file != null && !file.isEmpty()) {
            try {
                String uploadDir = System.getProperty("user.dir") + "/uploads/";
                File directory = new File(uploadDir);
                if (!directory.exists()) directory.mkdirs();

                String filePath = uploadDir + System.currentTimeMillis() + "_" + file.getOriginalFilename();
                file.transferTo(new File(filePath));
                submission.setFilePath(filePath);
            } catch (IOException e) {
                throw new RuntimeException("Failed to upload file", e);
            }
        }

        return submissionRepository.save(submission);
    }

}
