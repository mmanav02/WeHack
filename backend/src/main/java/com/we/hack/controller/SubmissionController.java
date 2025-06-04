package com.we.hack.controller;

import com.we.hack.dto.*;
import com.we.hack.mapper.SubmissionMapper;
import com.we.hack.model.Hackathon;
import com.we.hack.model.Submission;
import com.we.hack.model.Team;
import com.we.hack.repository.HackathonRepository;
import com.we.hack.repository.TeamRepository;
import com.we.hack.service.builder.Submission.ConcreteSubmissionBuilder;
import com.we.hack.service.builder.Submission.SubmissionBuilder;
import com.we.hack.service.impl.SubmissionServiceImpl;
import com.we.hack.service.iterator.CollectionFactory;
import com.we.hack.service.iterator.Iterator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @PostMapping("/submitProject")
    public Submission submitProject(
            @RequestBody SubmitProjectRequest request
            ) {

        SubmissionBuilder builder = new ConcreteSubmissionBuilder()
                .title(request.getTitle())
                .description(request.getDescription())
                .projectUrl(request.getProjectUrl());
        return submissionService.createFinalSubmission(builder, request.getUserId(), request.getHackathonId(), request.getFile());
    }

    @PutMapping("/editSubmission")
    public Submission editSubmission(
            @RequestBody EditSubmissionRequest request
            ) {
        return submissionService.editSubmission(request.getHackathonId(), request.getUserId(), request.getSubmissionId(), request.getTitle(), request.getDescription(), request.getProjectUrl(), request.getFile());
    }



    @GetMapping("/iterator")
    public ResponseEntity<List<SubmissionDto>> listSubmissions(@RequestBody getSubmissionRequest request) {
        return ResponseEntity.ok(submissionService.listSubmissions(request.getHackathon(), request.getTeam()));
    }

    @PostMapping("/undoSubmission")
    public Submission undoSubmission(
            @RequestBody UndoSubmitProjectRequest request
            ) {
        return submissionService.undoLastEdit(request.getTeamId(), request.getSubmissionId(), request.getHackathonId());
    }

}
