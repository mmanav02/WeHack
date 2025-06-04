package com.we.hack.controller;

import com.we.hack.dto.EditSubmissionRequest;
import com.we.hack.dto.UndoSubmitProjectRequest;
import com.we.hack.model.Hackathon;
import com.we.hack.model.Submission;
import com.we.hack.model.Team;
import com.we.hack.model.User;
import com.we.hack.service.SubmissionService;
import com.we.hack.service.builder.Submission.ConcreteSubmissionBuilder;
import com.we.hack.service.builder.Submission.SubmissionBuilder;
import com.we.hack.service.impl.SubmissionServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/submissions")
public class SubmissionController {

    @Autowired
    private SubmissionServiceImpl submissionService;

    // POST /submissions/{hackathonId}/user/{userId}
//    @PostMapping("/{hackathonId}/user/{userId}")

    @PostMapping(value = "/submitProject", consumes = "multipart/form-data")
    public Submission submitProject(
            @RequestParam("hackathonId") int hackathonId,
            @RequestParam("userId") Long userId,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("projectUrl") String projectUrl,
            @RequestPart("file") MultipartFile file
    ) {

//        Submission submission = new Submission();
//        submission.setTitle(title);
//        submission.setDescription(description);
//        submission.setProjectUrl(projectUrl);
//        submission.setFilePath("uploads/" + new File(filePath).getName());

//        submissionService.validateSubmission(userId, hackathonId, submission, file);
//
//        String filePath = null;
//
//        if (file != null && !file.isEmpty()) {
//            try {
//                String uploadDir = System.getProperty("user.dir") + "/uploads/";
//                File directory = new File(uploadDir);
//                if (!directory.exists()) directory.mkdirs();
//
//                filePath = uploadDir + System.currentTimeMillis() + "_" + file.getOriginalFilename();
//                file.transferTo(new File(filePath));
//
//                // Set relative path to store in DB
//                submission.setFilePath("uploads/" + new File(filePath).getName());
//            } catch (Exception e) {
//                throw new RuntimeException("File upload failed", e);
//            }
//        }

        Submission submission = submissionService.createFinalSubmission(
                new ConcreteSubmissionBuilder()
                        .title(title)
                        .description(description)
                        .projectUrl(projectUrl),
                userId,
                hackathonId,
                file
        );
        Hackathon hackathon = submission.getHackathon(); // assuming submission has hackathon reference
        User organizer = hackathon.getOrganizer();       // make sure this relationship exists
        User submittingUser = submission.getUser();
        Team team = submission.getTeam();

        Set<String> recipientEmails = new HashSet<>();
        recipientEmails.add(submittingUser.getEmail());
        if (team != null && team.getUsers() != null) {
            for (User member : team.getUsers()) {
                if (member != null && member.getEmail() != null) {
                    recipientEmails.add(member.getEmail()); // Set ensures no duplicates
                }
            }
        }

        submissionService.notifyOrganizer(
                submission.getHackathon(),
                organizer,
                new ArrayList<>(recipientEmails),
                "New Submission for: " + submission.getHackathon().getTitle(),
                "Team " + team.getName() + " just submitted their project!"
        );

        return submission;
    }

    @PutMapping("/editSubmission")
    public Submission editSubmission(
//            @PathVariable int hackathonId,
//            @PathVariable Long userId,
//            @PathVariable Long submissionId,
//            @RequestParam("title") String title,
//            @RequestParam("description") String description,
//            @RequestParam("projectUrl") String projectUrl,
//            @RequestParam(value = "file", required = false) MultipartFile file
            @RequestBody EditSubmissionRequest request
            ) {
        return submissionService.editSubmission(request.getHackathonId(), request.getUserId(), request.getSubmissionId(), request.getTitle(), request.getDescription(), request.getProjectUrl(), request.getFile());
    }

//    @PostMapping("/{hackathonId}/team/{teamId}/submission/{submissionId}/undo")
    @PostMapping("/undoSubmission")
    public Submission undoSubmission(
//            @PathVariable Long teamId,
//            @PathVariable Long submissionId,
//            @PathVariable Long hackathonId
            @RequestBody UndoSubmitProjectRequest request
            ) {
        return submissionService.undoLastEdit(request.getTeamId(), request.getSubmissionId(), request.getHackathonId());
    }

}
