package com.we.hack.controller;

import com.we.hack.dto.DeleteHackathonRequest;
import com.we.hack.dto.HackathonDto;
import com.we.hack.dto.HackathonRequest;
import com.we.hack.mapper.HackathonMapper;
import com.we.hack.model.Hackathon;
import com.we.hack.model.Submission;
import com.we.hack.model.User;
import com.we.hack.service.HackathonService;
import com.we.hack.repository.UserRepository;
import com.we.hack.service.iterator.CollectionFactory;
import com.we.hack.service.iterator.Iterator;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/hackathons")
public class HackathonController {
    @PostConstruct
    public void init() {
        System.out.println("✅ HackathonController is loaded");
    }
    @Autowired
    private HackathonService hackathonService;

    @Autowired
    private UserRepository userRepository;


    // Create a new hackathon
    @PostMapping("/create")
    public Hackathon createHackathon(@RequestBody HackathonRequest request) {
        User organizer = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + request.getUserId()));

        return hackathonService.createHackathon(
                request.getTitle(),
                request.getDescription(),
                request.getStartDate(),
                request.getEndDate(),
                organizer,
                request.getScoringMethod(),
                request.getSmtpPassword(),
                request.getMailMode(),
                request.isSlackEnabled()
        );
    }

    @DeleteMapping("/delete")
    public void deleteHackathon(@RequestBody DeleteHackathonRequest request) {
        hackathonService.deleteHackathon(request.getHackathonId());
    }


    // Get all hackathons
//    @GetMapping
//    public List<Hackathon> getAllHackathons() {
//        return hackathonService.getAllHackathons();
//    }


    // Publish a hackathon
    @PutMapping("/{hackathonId}/publish")
    public ResponseEntity<String> publishHackathon(@PathVariable int hackathonId) {
        hackathonService.publishHackathon(hackathonId);
        return ResponseEntity.ok("Hackathon published.");
    }

    // Begin judging phase
    @PutMapping("/{hackathonId}/judging")
    public ResponseEntity<String> startJudging(@PathVariable int hackathonId) {
        hackathonService.startJudging(hackathonId);
        return ResponseEntity.ok("Hackathon moved to judging phase.");
    }

    // Complete the hackathon
    @PutMapping("/{hackathonId}/complete")
    public ResponseEntity<String> completeHackathon(@PathVariable int hackathonId) {
        hackathonService.completeHackathon(hackathonId);
        return ResponseEntity.ok("Hackathon marked as completed.");
    }

    @GetMapping("/iterator")
    public ResponseEntity<List<HackathonDto>> listHackathons() {
        return ResponseEntity.ok(hackathonService.listHackathons());
    }

    @GetMapping("/{hackathonId}/leaderboard")
    public ResponseEntity<List<Submission>> getLeaderboard(@PathVariable Long hackathonId) {
        List<Submission> leaderboard = hackathonService.getLeaderboard(hackathonId);
        return ResponseEntity.ok(leaderboard);
    }
}
