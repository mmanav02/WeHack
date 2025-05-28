package com.we.hack.controller;

import com.we.hack.dto.HackathonRequest;
import com.we.hack.model.Hackathon;
import com.we.hack.model.User;
import com.we.hack.service.HackathonService;
import com.we.hack.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

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
                request.getDate(),
                organizer
        );
    }


    // Get all hackathons
    @GetMapping
    public List<Hackathon> getAllHackathons() {
        return hackathonService.getAllHackathons();
    }
}
