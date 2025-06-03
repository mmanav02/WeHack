package com.we.hack.service.impl;

import com.we.hack.dto.MailModes;
import com.we.hack.model.*;
import com.we.hack.repository.HackathonRepository;
import com.we.hack.repository.HackathonRoleRepository;
import com.we.hack.repository.UserRepository;
import com.we.hack.service.HackathonService;
import com.we.hack.service.observer.HackathonNotificationManager;
import com.we.hack.service.observer.JudgeNotifier;
import com.we.hack.service.state.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HackathonServiceImpl implements HackathonService {

    @Autowired
    private HackathonRepository hackathonRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    private HackathonRoleRepository hackathonRoleRepository;

    @Override
    public Hackathon createHackathon(String title, String description, String date, User organizer, ScoringMethod scoringMethod, String smtpPassword, MailModes mailMode) {
        if(mailMode == MailModes.ORGANIZED) {
            User organizerFetch = userRepository.getReferenceById((long) organizer.getId());
            organizerFetch.setSmtpPassword(smtpPassword);
            userRepository.save(organizerFetch);
        }

        Hackathon hackathon = new Hackathon();
        hackathon.setTitle(title);
        hackathon.setDescription(description);
        hackathon.setDate(date);
        hackathon.setOrganizer(organizer);
        hackathon.setScoringMethod(scoringMethod);
        hackathon.setStatus("Draft");
        hackathon.setMailMode(mailMode);
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

        //  Notify all already registered judges
        HackathonNotificationManager notifier = new HackathonNotificationManager();
        notifier.notifyObservers(hackathonId, "Hackathon \"" + hackathon.getTitle() + "\" is now Published!");
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
