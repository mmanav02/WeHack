package com.we.hack.controller;

import com.we.hack.model.Submission;
import com.we.hack.service.SubmissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;

@RestController
@RequestMapping("/submissions")
public class SubmissionController {

    @Autowired
    private SubmissionService submissionService;

    // POST /submissions/{hackathonId}/user/{userId}
    @PostMapping("/{hackathonId}/user/{userId}")
    public Submission submitProject(
            @PathVariable int hackathonId,
            @PathVariable Long userId,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("projectUrl") String projectUrl,
            @RequestParam(value = "file", required = false) MultipartFile file
    ) {


        Submission submission = new Submission();
        submission.setTitle(title);
        submission.setDescription(description);
        submission.setProjectUrl(projectUrl);
//        submission.setFilePath("uploads/" + new File(filePath).getName());

        submissionService.validateSubmission(userId, hackathonId, submission, file);

        String filePath = null;

        if (file != null && !file.isEmpty()) {
            try {
                String uploadDir = System.getProperty("user.dir") + "/uploads/";
                File directory = new File(uploadDir);
                if (!directory.exists()) directory.mkdirs();

                filePath = uploadDir + System.currentTimeMillis() + "_" + file.getOriginalFilename();
                file.transferTo(new File(filePath));

                // Set relative path to store in DB
                submission.setFilePath("uploads/" + new File(filePath).getName());
            } catch (Exception e) {
                throw new RuntimeException("File upload failed", e);
            }
        }

        return submissionService.saveSubmission(userId, hackathonId, submission);
    }
}
