package com.we.hack.service.impl;

import com.we.hack.model.Hackathon;
import com.we.hack.model.ScoringMethod;
import com.we.hack.model.User;
import com.we.hack.repository.HackathonRepository;
import com.we.hack.service.HackathonService;
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
        return hackathonRepository.save(hackathon);
    }

    @Override
    public List<Hackathon> getAllHackathons() {
        return hackathonRepository.findAll();
    }
}
