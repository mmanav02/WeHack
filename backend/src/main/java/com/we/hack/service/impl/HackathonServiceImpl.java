package com.we.hack.service.impl;

import com.we.hack.model.Hackathon;
import com.we.hack.model.ScoringMethod;
import com.we.hack.model.User;
import com.we.hack.repository.HackathonRepository;
import com.we.hack.service.HackathonService;
import com.we.hack.service.state.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HackathonServiceImpl implements HackathonService {

    @Autowired
    private HackathonRepository hackathonRepository;

    @Override
    public Hackathon createHackathon(String title, String description, String date, User organizer, ScoringMethod scoringMethod) {
        Hackathon hackathon = new Hackathon();
        hackathon.setTitle(title);
        hackathon.setDescription(description);
        hackathon.setDate(date);
        hackathon.setOrganizer(organizer);
        hackathon.setScoringMethod(scoringMethod);
        hackathon.setStatus("Draft");
        return hackathonRepository.save(hackathon);
    }

    public void deleteHackathon(long hackathonId) {
        hackathonRepository.deleteById((int) hackathonId);
    }

    @Override
    public List<Hackathon> getAllHackathons() {
        return hackathonRepository.findAll();
    }

    @Override
    public void publishHackathon(int hackathonId) {
        Hackathon hackathon = hackathonRepository.findById(hackathonId)
                .orElseThrow(() -> new RuntimeException("Hackathon not found"));

        HackathonContext context = new HackathonContext(getStateFromStatus(hackathon.getStatus()));
        context.publish(hackathon);
        hackathonRepository.save(hackathon);
    }


    @Override
    public void startJudging(int hackathonId) {
        Hackathon hackathon = hackathonRepository.findById(hackathonId)
                .orElseThrow(() -> new RuntimeException("Hackathon not found"));

        HackathonContext context = new HackathonContext(getStateFromStatus(hackathon.getStatus()));
        context.beginJudging(hackathon);
        hackathonRepository.save(hackathon);
    }

    @Override
    public void completeHackathon(int hackathonId) {
        Hackathon hackathon = hackathonRepository.findById(hackathonId)
                .orElseThrow(() -> new RuntimeException("Hackathon not found"));

        HackathonContext context = new HackathonContext(getStateFromStatus(hackathon.getStatus()));
        context.complete(hackathon);
        hackathonRepository.save(hackathon);
    }

    private HackathonState getStateFromStatus(String status) {
        switch (status) {
            case "Published":
                return new PublishedState();
            case "Judging":
                return new JudgingState();
            case "Completed":
                return new CompletedState();
            default:
                return new DraftState(); // Default fallback
        }
    }
}
