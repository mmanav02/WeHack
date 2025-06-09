package com.we.hack.service.impl;

import com.we.hack.dto.HackathonDto;
import com.we.hack.dto.MailModes;
import com.we.hack.dto.TeamDto;
import com.we.hack.mapper.HackathonMapper;
import com.we.hack.mapper.TeamMapper;
import com.we.hack.model.*;
import com.we.hack.repository.*;
import com.we.hack.service.HackathonService;
import com.we.hack.service.adapter.MailServiceAdapter;
import com.we.hack.service.factory.HackathonRoleFactory;
import com.we.hack.service.iterator.CollectionFactory;
import com.we.hack.service.iterator.Iterator;
import com.we.hack.service.observer.HackathonNotificationManager;
import com.we.hack.service.observer.HackathonObserver;
import com.we.hack.service.observer.HackathonObserverRegistry;
import com.we.hack.service.observer.JudgeNotifier;
import com.we.hack.service.state.*;
import com.we.hack.service.template.BuildPhaseScoreboard;
import com.we.hack.service.template.JudgingPhaseScoreboard;
import com.we.hack.service.template.ScoreboardTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityManager;

import java.time.Instant;
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
    private MailServiceAdapter mailServiceAdapter;

    @Autowired
    private JudgeScoreRepository judgeScoreRepository;

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private EntityManager entityManager;

    @Autowired
    private ApplicationContext applicationContext;

    @Override
    public Hackathon createHackathon(String title, String description, Instant startDate, Instant endDate, User organizer, ScoringMethod scoringMethod, String smtpPassword, MailModes mailMode, boolean slackEnabled) {
        if(mailMode == MailModes.ORGANIZED) {
            User organizerFetch = userRepository.getReferenceById((long) organizer.getId());
            organizerFetch.setSmtpPassword(smtpPassword);
            userRepository.save(organizerFetch);
        }

        Hackathon hackathon = new Hackathon();
        hackathon.setTitle(title);
        hackathon.setDescription(description);
        hackathon.setStartDate(startDate);
        hackathon.setEndDate(endDate);
        hackathon.setOrganizer(organizer);
        hackathon.setScoringMethod(scoringMethod);
        hackathon.setStatus("Draft");
        hackathon.setMailMode(mailMode);
        hackathon.setSlackEnabled(slackEnabled);
        return hackathonRepository.save(hackathon);
    }

    @Transactional
    public void deleteHackathon(long hackathonId) {
        try {
            // Clear Hibernate session to avoid any cached entities
            entityManager.flush();
            entityManager.clear();
            
            // Delete in proper order to respect foreign key constraints
            // 1. Delete hackathon roles first
            hackathonRoleRepository.deleteByHackathonId((int) hackathonId);
            
            // 2. Clear team-submission relationships to avoid circular reference issues
            entityManager.createNativeQuery("UPDATE teams SET submission_id = NULL WHERE hackathon_id = ?")
                    .setParameter(1, hackathonId)
                    .executeUpdate();
            
            // 3. Clear submission-team relationships 
            entityManager.createNativeQuery("UPDATE submission SET team_id = NULL WHERE hackathon_id = ?")
                    .setParameter(1, hackathonId)
                    .executeUpdate();
            
            // 4. Delete judge scores (must be done before submissions)
            judgeScoreRepository.deleteByHackathonId((int) hackathonId);
            
            // 5. Delete team_members junction table entries
            entityManager.createNativeQuery("DELETE FROM team_members WHERE team_id IN (SELECT id FROM teams WHERE hackathon_id = ?)")
                    .setParameter(1, hackathonId)
                    .executeUpdate();
            
            // 6. Delete teams 
            teamRepository.deleteByHackathonId((int) hackathonId);
            
            // 7. Delete submissions
            submissionRepository.deleteByHackathonId((int) hackathonId);
            
            // 8. Finally delete the hackathon
            hackathonRepository.deleteById((int) hackathonId);
            
            // Force commit
            entityManager.flush();
        } catch (Exception e) {
            System.err.println("Error deleting hackathon " + hackathonId + ": " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to delete hackathon: " + e.getMessage(), e);
        }
    }

    @Override
    public List<Hackathon> getAllHackathons() {
        return hackathonRepository.findAllOrderByIdDesc();
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

        HackathonNotificationManager notifier = new HackathonNotificationManager();
        List<HackathonObserver> judgeObservers = HackathonObserverRegistry.getObservers(hackathonId);
        for (HackathonObserver observer : judgeObservers) {
            notifier.registerObserver(observer);
        }
        notifier.notifyObservers(hackathonId, "Hackathon \"" + hackathon.getTitle() + "\" is now Published!");
    }


    @Override
    public void startJudging(int hackathonId) {
        Hackathon hackathon = hackathonRepository.findById(hackathonId)
                .orElseThrow(() -> new RuntimeException("Hackathon not found"));

        HackathonContext context = new HackathonContext(getStateFromStatus(hackathon.getStatus()));
        context.beginJudging(hackathon);
        HackathonNotificationManager notifier = new HackathonNotificationManager();
        List<HackathonObserver> judgeObservers = HackathonObserverRegistry.getObservers(hackathonId);
        for (HackathonObserver observer : judgeObservers) {
            notifier.registerObserver(observer);
        }
        notifier.notifyObservers(hackathonId, "Hackathon \"" + hackathon.getTitle() + "\": Judging phase started");
        hackathonRepository.save(hackathon);
    }

    @Override
    public void completeHackathon(int hackathonId) {
        Hackathon hackathon = hackathonRepository.findById(hackathonId)
                .orElseThrow(() -> new RuntimeException("Hackathon not found"));

        HackathonContext context = new HackathonContext(getStateFromStatus(hackathon.getStatus()));
        context.complete(hackathon);
        HackathonNotificationManager notifier = new HackathonNotificationManager();
        List<HackathonObserver> judgeObservers = HackathonObserverRegistry.getObservers(hackathonId);
        for (HackathonObserver observer : judgeObservers) {
            notifier.registerObserver(observer);
        }
        notifier.notifyObservers(hackathonId, "Hackathon \"" + hackathon.getTitle() + "\": Completed. Check Leaderboards");
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
        // Return all judge requests for the hackathon (PENDING, APPROVED, REJECTED)
        // to show complete status to organizer
        return hackathonRoleRepository.findByHackathonIdAndRole(hackathonId, Role.JUDGE);
    }

    @Override
    public List<HackathonRole> getParticipants(int hackathonId) {
        // Return all participants (approved only since participants are auto-approved)
        return hackathonRoleRepository.findByHackathonIdAndRoleAndStatus(hackathonId, Role.PARTICIPANT, ApprovalStatus.APPROVED);
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

        // Handle null mailMode with default fallback
        MailModes mailMode = hackathon.getMailMode() != null ? hackathon.getMailMode() : MailModes.NONE;
        
        MailServiceAdapter adapter = switch (mailMode) {
            case ORGANIZED -> mailServiceAdapter;
            case MAILGUN -> mailServiceAdapter;
            case NONE -> mailServiceAdapter;
        };

        if (status.equals(ApprovalStatus.APPROVED)) {
            JudgeNotifier judgeNotifier = new JudgeNotifier(judgeEmail, Organizer, adapter);
            judgeNotifier.update(hackathon.getTitle() + ": Judge Request Approved!");
            HackathonObserverRegistry.registerObserver(
                    Math.toIntExact(hackathonId), judgeNotifier
            );
        }
        return hackathonRoleRepository.save(roleEntry);
    }

    @Override
    public List<Submission> getLeaderboard(Long hackathonId) {
        Hackathon hackathon = hackathonRepository.findById(Math.toIntExact(hackathonId))
                .orElseThrow(() -> new RuntimeException("Hackathon not found"));
        String status = hackathon.getStatus();

        ScoreboardTemplate scoreboard;
        if (status.equals("Draft") || status.equals("Published")) {
            scoreboard = applicationContext.getBean(BuildPhaseScoreboard.class);
        } else {
            scoreboard = applicationContext.getBean(JudgingPhaseScoreboard.class);
        }

        return scoreboard.generate(hackathonId);
    }
}
