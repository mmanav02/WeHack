package com.we.hack.service.impl;

import com.we.hack.dto.HackathonDto;
import com.we.hack.dto.MailModes;
import com.we.hack.dto.TeamDto;
import com.we.hack.dto.getSubmissionRequest;
import com.we.hack.mapper.HackathonMapper;
import com.we.hack.mapper.TeamMapper;
import com.we.hack.model.*;
import com.we.hack.repository.HackathonRepository;
import com.we.hack.repository.HackathonRoleRepository;
import com.we.hack.repository.SubmissionRepository;
import com.we.hack.repository.UserRepository;
import com.we.hack.service.HackathonService;
import com.we.hack.service.adapter.MailgunAdapter;
import com.we.hack.service.adapter.OrganizerMailAdapter;
import com.we.hack.service.factory.HackathonRoleFactory;
import com.we.hack.service.iterator.CollectionFactory;
import com.we.hack.service.iterator.Iterator;
import com.we.hack.service.observer.HackathonNotificationManager;
import com.we.hack.service.observer.HackathonObserverRegistry;
import com.we.hack.service.observer.JudgeNotifier;
import com.we.hack.service.state.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class HackathonServiceImpl implements HackathonService {

    @Autowired
    private HackathonRepository hackathonRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HackathonRoleRepository hackathonRoleRepository;

    @Autowired
    private CollectionFactory collectionFactory;

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private MailgunAdapter mailgunAdapter;

    @Autowired
    private OrganizerMailAdapter organizerMailAdapter;

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
    public List<HackathonDto> listHackathons(){
        Iterator<Hackathon> it = collectionFactory.hackathons().createIterator();
        List<HackathonDto> result = new ArrayList<>();
        while (it.hasNext()) {
            result.add(HackathonMapper.toDto(it.next()));
        }
        return result;
    }

    @Override
    public List<TeamDto> listTeams(Hackathon hackathon) {
        Iterator<Team> it = collectionFactory.teams(hackathon).createIterator();
        List<TeamDto> result = new ArrayList<>();
        while (it.hasNext()) {
            result.add(TeamMapper.toDto(it.next()));   // convertEntity->DTO
        }
        return result;
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


    // *******************************************************************
    // HackathonRoleService ->
    @Override
    public HackathonRole joinHackathon(Long userId, int hackathonId, Role role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Hackathon hackathon = hackathonRepository.findById(hackathonId)
                .orElseThrow(() -> new RuntimeException("Hackathon not found"));

        HackathonRole hackathonRole = HackathonRoleFactory.create(user, hackathon, role);

        return hackathonRoleRepository.save(hackathonRole);
    }

    @Override
    public void leaveHackathon(long userId, long hackathonId) {

        // 1. Make sure the link row actually exists
        HackathonRole link = hackathonRoleRepository
                .findByUserIdAndHackathonId(userId, hackathonId)
                .orElseThrow(() -> new RuntimeException("User is not enrolled in this hackathon"));

        // 2. Delete every submission this user made in that event
        submissionRepository.deleteByUserAndHackathon(userId, hackathonId);

        // 3. Delete the membership row itself
        hackathonRoleRepository.delete(link);
    }

    @Override
    public List<HackathonRole> getPendingJudgeRequests(int hackathonId) {
        return hackathonRoleRepository.findByHackathonIdAndRoleAndStatus(
                hackathonId, Role.JUDGE, ApprovalStatus.PENDING
        );
    }

    @Override
    public HackathonRole updateJudgeStatus(Long hackathonId, Long userId, ApprovalStatus status) {
        HackathonRole roleEntry = hackathonRoleRepository.findAll().stream()
                .filter(r -> r.getHackathon().getId().equals(hackathonId) &&
                        r.getUser().getId() == userId &&
                        r.getRole() == Role.JUDGE)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Judge request not found"));

        Hackathon hackathon = hackathonRepository.findById(Math.toIntExact(hackathonId))
                .orElseThrow(() -> new RuntimeException("Hackathon not found"));

        User Organizer = hackathon.getOrganizer();

        User Judge = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        String judgeEmail = Judge.getEmail();

        roleEntry.setStatus(status);

        if(hackathon.getMailMode() == MailModes.ORGANIZED) {
            if (status.equals(ApprovalStatus.APPROVED)) {
                JudgeNotifier judgeNotifier = new JudgeNotifier(judgeEmail, Organizer, organizerMailAdapter);
                judgeNotifier.update("Hackathon \"" + hackathon.getTitle() + "\" is now Published!");
                HackathonObserverRegistry.registerObserver(
                        Math.toIntExact(hackathonId),judgeNotifier
                );

                System.out.println("Judge request approved");
            }
        }else if(hackathon.getMailMode() == MailModes.MAILGUN){
            if (status.equals(ApprovalStatus.APPROVED)) {
                JudgeNotifier judgeNotifier = new JudgeNotifier(judgeEmail, Organizer, mailgunAdapter);
                judgeNotifier.update("Hackathon \"" + hackathon.getTitle() + "\" is now Published!");
                HackathonObserverRegistry.registerObserver(
                        Math.toIntExact(hackathonId),
                        new JudgeNotifier(judgeEmail, Organizer, mailgunAdapter)
                );

                System.out.println("Judge request approved");
            }
        }
        return hackathonRoleRepository.save(roleEntry);
    }

}
