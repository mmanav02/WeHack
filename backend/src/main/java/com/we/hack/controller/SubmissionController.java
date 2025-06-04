package com.we.hack.controller;

import com.we.hack.dto.*;
import com.we.hack.mapper.SubmissionMapper;
import com.we.hack.mapper.TeamMapper;
import com.we.hack.model.Hackathon;
import com.we.hack.model.Submission;
import com.we.hack.model.Team;
import com.we.hack.repository.HackathonRepository;
import com.we.hack.repository.TeamRepository;
import com.we.hack.service.SubmissionService;
import com.we.hack.service.builder.Submission.ConcreteSubmissionBuilder;
import com.we.hack.service.builder.Submission.SubmissionBuilder;
import com.we.hack.service.impl.SubmissionServiceImpl;
import com.we.hack.service.iterator.CollectionFactory;
import com.we.hack.service.iterator.Iterator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/submissions")
public class SubmissionController {

    @Autowired
    private SubmissionServiceImpl submissionService;

    @Autowired
    private CollectionFactory collectionFactory;

    @Autowired
    private HackathonRepository hackathonRepository;

    @Autowired
    private TeamRepository teamRepository;

    // POST /submissions/{hackathonId}/user/{userId}
//    @PostMapping("/{hackathonId}/user/{userId}")
    @PostMapping("/submitProject")
    public Submission submitProject(
//            @PathVariable int hackathonId,
//            @PathVariable Long userId,
//            @RequestParam("title") String title,
//            @RequestParam("description") String description,
//            @RequestParam("projectUrl") String projectUrl,
//            @RequestParam(value = "file", required = false) MultipartFile file
            @RequestBody SubmitProjectRequest request
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

        SubmissionBuilder builder = new ConcreteSubmissionBuilder()
                .title(request.getTitle())
                .description(request.getDescription())
                .projectUrl(request.getProjectUrl());
        return submissionService.createFinalSubmission(builder, request.getUserId(), request.getHackathonId(), request.getFile());
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



    @GetMapping("/iterator")
    public ResponseEntity<List<SubmissionDto>> listSubmissions(
            @RequestParam Long hackathonId,
            @RequestParam Long teamId
    ) {
        Hackathon hackathon = hackathonRepository.findById(Math.toIntExact(hackathonId)).orElseThrow();
        Team team = teamRepository.findById(teamId).orElseThrow();

        Iterator<Submission> it = collectionFactory.submissions(team, hackathon).createIterator();
        List<SubmissionDto> result = new ArrayList<>();
        while (it.hasNext()) {
            result.add(SubmissionMapper.toDto(it.next()));
        }
        return ResponseEntity.ok(result);
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
