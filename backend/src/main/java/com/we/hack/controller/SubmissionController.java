package com.we.hack.controller;

import com.we.hack.model.Submission;
import com.we.hack.service.SubmissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

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
            @RequestBody Submission submission
    ) {
        return submissionService.submitProject(userId, hackathonId, submission);
    }
}
