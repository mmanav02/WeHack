package com.we.hack.controller;

import com.we.hack.dto.DeleteHackathonRequest;
import com.we.hack.dto.HackathonDto;
import com.we.hack.dto.HackathonRequest;
import com.we.hack.mapper.HackathonMapper;
import com.we.hack.model.Hackathon;
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

    @Autowired
    private CollectionFactory collectionFactory;

    // Create a new hackathon
    @PostMapping("/create")
    public Hackathon createHackathon(@RequestBody HackathonRequest request) {
        User organizer = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + request.getUserId()));
        System.out.println(request.getSmtpPassword());
        return hackathonService.createHackathon(
                request.getTitle(),
                request.getDescription(),
                request.getDate(),
                organizer,
                request.getScoringMethod(),
                request.getSmtpPassword(),
                request.getMailMode()
        );
    }

    @DeleteMapping("/delete")
    public void deleteHackathon(@RequestBody DeleteHackathonRequest request) {
        hackathonService.deleteHackathon(request.getHackathonId());
    }


    // Get all hackathons
    @GetMapping
    public List<Hackathon> getAllHackathons() {
        return hackathonService.getAllHackathons();
    }


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
        Iterator<Hackathon> it = collectionFactory.hackathons().createIterator();
        List<HackathonDto> result = new ArrayList<>();
        while (it.hasNext()) {
            result.add(HackathonMapper.toDto(it.next()));
        }
        return ResponseEntity.ok(result);
    }

}
