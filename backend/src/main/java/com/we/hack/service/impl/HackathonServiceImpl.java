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
import com.we.hack.service.logger.Logger;
import com.we.hack.service.ObserverNotification.UnifiedNotificationService;
import com.we.hack.service.state.*;
import com.we.hack.service.template.BuildPhaseScoreboard;
import com.we.hack.service.template.JudgingPhaseScoreboard;
import com.we.hack.service.template.ScoreboardTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityManager;

import java.io.IOException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
public class HackathonServiceImpl implements HackathonService {

    private static Logger logger;
    
    static {
        try {
            logger = Logger.getInstance(100);
        } catch (IOException e) {
            System.err.println("Failed to initialize logger: " + e.getMessage());
        }
    }

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

    @Autowired
    private UnifiedNotificationService unifiedNotificationService;

    @Override
    public Hackathon createHackathon(String title, String description, Instant startDate, Instant endDate, User organizer, ScoringMethod scoringMethod, String smtpPassword, MailModes mailMode, boolean slackEnabled) {
        logger.INFO("HackathonService.createHackathon() - Started creating hackathon with title: " + title);
        logger.DEBUG("Parameters: organizer=" + organizer.getEmail() + ", scoring=" + scoringMethod + ", mailMode=" + mailMode + ", slackEnabled=" + slackEnabled);
        
        try {
            if(mailMode == MailModes.ORGANIZED) {
                logger.INFO("Setting SMTP password for organizer: " + organizer.getEmail());
                User organizerFetch = userRepository.getReferenceById((long) organizer.getId());
                organizerFetch.setSmtpPassword(smtpPassword);
                userRepository.save(organizerFetch);
                logger.DEBUG("SMTP password set successfully for organizer");
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
            
            Hackathon savedHackathon = hackathonRepository.save(hackathon);
            logger.INFO("Hackathon created successfully with ID: " + savedHackathon.getId());
            return savedHackathon;
            
        } catch (Exception e) {
            logger.ERROR("Failed to create hackathon: " + e.getMessage());
            logger.SEVERE("Stack trace: " + e.toString());
            throw e;
        }
    }

    @Transactional
    public void deleteHackathon(long hackathonId) {
        logger.INFO("HackathonService.deleteHackathon() - Started deleting hackathon ID: " + hackathonId);
        
        try {
            // Clear Hibernate session to avoid any cached entities
            logger.DEBUG("Clearing Hibernate session");
            entityManager.flush();
            entityManager.clear();
            
            // Delete in proper order to respect foreign key constraints
            logger.INFO("Starting cascade deletion for hackathon ID: " + hackathonId);
            
            // 1. Delete hackathon roles first
            logger.DEBUG("Deleting hackathon roles");
            hackathonRoleRepository.deleteByHackathonId((int) hackathonId);
            
            // 2. Clear team-submission relationships to avoid circular reference issues
            logger.DEBUG("Clearing team-submission relationships");
            entityManager.createNativeQuery("UPDATE teams SET submission_id = NULL WHERE hackathon_id = ?")
                    .setParameter(1, hackathonId)
                    .executeUpdate();
            
            // 3. Clear submission-team relationships 
            logger.DEBUG("Clearing submission-team relationships");
            entityManager.createNativeQuery("UPDATE submission SET team_id = NULL WHERE hackathon_id = ?")
                    .setParameter(1, hackathonId)
                    .executeUpdate();
            
            // 4. Delete judge scores (must be done before submissions)
            logger.DEBUG("Deleting judge scores");
            judgeScoreRepository.deleteByHackathonId((int) hackathonId);
            
            // 5. Delete team_members junction table entries
            logger.DEBUG("Deleting team member relationships");
            entityManager.createNativeQuery("DELETE FROM team_members WHERE team_id IN (SELECT id FROM teams WHERE hackathon_id = ?)")
                    .setParameter(1, hackathonId)
                    .executeUpdate();
            
            // 6. Delete teams 
            logger.DEBUG("Deleting teams");
            teamRepository.deleteByHackathonId((int) hackathonId);
            
            // 7. Delete submissions
            logger.DEBUG("Deleting submissions");
            submissionRepository.deleteByHackathonId((int) hackathonId);
            
            // 8. Finally delete the hackathon
            logger.DEBUG("Deleting hackathon entity");
            hackathonRepository.deleteById((int) hackathonId);
            
            // Force commit
            logger.DEBUG("Forcing commit");
            entityManager.flush();
            
            logger.INFO("Hackathon ID: " + hackathonId + " deleted successfully");
            
        } catch (Exception e) {
            logger.ERROR("Error deleting hackathon " + hackathonId + ": " + e.getMessage());
            logger.SEVERE("Stack trace: " + e.toString());
            e.printStackTrace();
            throw new RuntimeException("Failed to delete hackathon: " + e.getMessage(), e);
        }
    }

    @Override
    public List<Hackathon> getAllHackathons() {
        logger.INFO("HackathonService.getAllHackathons() - Fetching all hackathons");
        
        try {
            List<Hackathon> hackathons = hackathonRepository.findAllOrderByIdDesc();
            logger.INFO("Retrieved " + hackathons.size() + " hackathons from database");
            return hackathons;
        } catch (Exception e) {
            logger.ERROR("Failed to fetch all hackathons: " + e.getMessage());
            throw e;
        }
    }

    @Override
    public List<HackathonDto> listHackathons(){
        logger.INFO("HackathonService.listHackathons() - Building hackathon DTOs using iterator pattern");
        
        try {
            Iterator<Hackathon> it = collectionFactory.hackathons().createIterator();
            List<HackathonDto> result = new ArrayList<>();
            int count = 0;
            
            while (it.hasNext()) {
                result.add(HackathonMapper.toDto(it.next()));
                count++;
            }
            
            logger.INFO("Mapped " + count + " hackathons to DTOs using factory pattern");
            return result;
        } catch (Exception e) {
            logger.ERROR("Failed to build hackathon DTOs: " + e.getMessage());
            throw e;
        }
    }

    @Override
    public List<TeamDto> listTeams(Hackathon hackathon) {
        logger.INFO("HackathonService.listTeams() - Listing teams for hackathon: " + hackathon.getTitle());
        
        try {
            Iterator<Team> it = collectionFactory.teams(hackathon).createIterator();
            List<TeamDto> result = new ArrayList<>();
            int count = 0;
            
            while (it.hasNext()) {
                result.add(TeamMapper.toDto(it.next()));   // convertEntity->DTO
                count++;
            }
            
            logger.INFO("Retrieved " + count + " teams for hackathon ID: " + hackathon.getId());
            return result;
        } catch (Exception e) {
            logger.ERROR("Failed to list teams for hackathon " + hackathon.getId() + ": " + e.getMessage());
            throw e;
        }
    }

    @Override
    public void publishHackathon(int hackathonId) {
        logger.INFO("HackathonService.publishHackathon() - Publishing hackathon ID: " + hackathonId);
        
        try {
            Hackathon hackathon = hackathonRepository.findById(hackathonId)
                    .orElseThrow(() -> {
                        logger.ERROR("Hackathon not found with ID: " + hackathonId);
                        return new RuntimeException("Hackathon not found");
                    });

            logger.DEBUG("Found hackathon: " + hackathon.getTitle() + ", current status: " + hackathon.getStatus());

            // State pattern for hackathon lifecycle
            HackathonContext context = new HackathonContext(getStateFromStatus(hackathon.getStatus()));
            context.publish(hackathon);
            hackathonRepository.save(hackathon);
            
            logger.INFO("Hackathon status updated to: " + hackathon.getStatus());

            // Use unified notification service (Decorator + Observer patterns combined)
            String message = "🎉 Hackathon \"" + hackathon.getTitle() + "\" is now Published! Join now and start building amazing projects!";
            unifiedNotificationService.broadcastNotification(hackathonId, hackathon, 
                "Hackathon Published", message);
            
            logger.INFO("Published hackathon " + hackathonId + " with unified notifications sent to all observers");
            
        } catch (Exception e) {
            logger.ERROR("Failed to publish hackathon " + hackathonId + ": " + e.getMessage());
            logger.SEVERE("Stack trace: " + e.toString());
            throw e;
        }
    }

    @Override
    public void startJudging(int hackathonId) {
        logger.INFO("HackathonService.startJudging() - Starting judging for hackathon ID: " + hackathonId);
        
        try {
            Hackathon hackathon = hackathonRepository.findById(hackathonId)
                    .orElseThrow(() -> {
                        logger.ERROR("Hackathon not found with ID: " + hackathonId);
                        return new RuntimeException("Hackathon not found");
                    });

            logger.DEBUG("Found hackathon: " + hackathon.getTitle() + ", current status: " + hackathon.getStatus());

            // State pattern for hackathon lifecycle
            HackathonContext context = new HackathonContext(getStateFromStatus(hackathon.getStatus()));
            context.beginJudging(hackathon);
            hackathonRepository.save(hackathon);

            logger.INFO("Hackathon status updated to: " + hackathon.getStatus());

            // Use unified notification service (Decorator + Observer patterns combined)
            String message = "⚖️ Hackathon \"" + hackathon.getTitle() + "\" has entered the judging phase! Judges can now evaluate submissions.";
            unifiedNotificationService.broadcastNotification(hackathonId, hackathon, 
                "Judging Phase Started", message);
            
            logger.INFO("Started judging for hackathon " + hackathonId + " with unified notifications sent to all observers");
            
        } catch (Exception e) {
            logger.ERROR("Failed to start judging for hackathon " + hackathonId + ": " + e.getMessage());
            logger.SEVERE("Stack trace: " + e.toString());
            throw e;
        }
    }

    @Override
    public void completeHackathon(int hackathonId) {
        logger.INFO("HackathonService.completeHackathon() - Completing hackathon ID: " + hackathonId);
        
        try {
            Hackathon hackathon = hackathonRepository.findById(hackathonId)
                    .orElseThrow(() -> {
                        logger.ERROR("Hackathon not found with ID: " + hackathonId);
                        return new RuntimeException("Hackathon not found");
                    });

            logger.DEBUG("Found hackathon: " + hackathon.getTitle() + ", current status: " + hackathon.getStatus());

            // State pattern for hackathon lifecycle
            HackathonContext context = new HackathonContext(getStateFromStatus(hackathon.getStatus()));
            context.complete(hackathon);
            hackathonRepository.save(hackathon);

            logger.INFO("Hackathon status updated to: " + hackathon.getStatus());

            // Use unified notification service (Decorator + Observer patterns combined)
            String message = "🏆 Hackathon \"" + hackathon.getTitle() + "\" has been completed! Check the leaderboard to see the winners!";
            unifiedNotificationService.broadcastNotification(hackathonId, hackathon, 
                "Hackathon Completed", message);
            
            logger.INFO("Completed hackathon " + hackathonId + " with unified notifications sent to all observers");
            
        } catch (Exception e) {
            logger.ERROR("Failed to complete hackathon " + hackathonId + ": " + e.getMessage());
            logger.SEVERE("Stack trace: " + e.toString());
            throw e;
        }
    }

    private HackathonState getStateFromStatus(String status) {
        logger.DEBUG("Getting state from status: " + status);
        
        switch (status) {
            case "Published":
                return new PublishedState();
            case "Judging":
                return new JudgingState();
            case "Completed":
                return new CompletedState();
            default:
                logger.DEBUG("Using default DraftState for status: " + status);
                return new DraftState(); // Default fallback
        }
    }

    // *******************************************************************
    // HackathonRoleService ->
    @Override
    public HackathonRole joinHackathon(Long userId, int hackathonId, Role role) {
        logger.INFO("HackathonService.joinHackathon() - User " + userId + " joining hackathon " + hackathonId + " as " + role);
        
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> {
                        logger.ERROR("User not found with ID: " + userId);
                        return new RuntimeException("User not found");
                    });

            Hackathon hackathon = hackathonRepository.findById(hackathonId)
                    .orElseThrow(() -> {
                        logger.ERROR("Hackathon not found with ID: " + hackathonId);
                        return new RuntimeException("Hackathon not found");
                    });

            logger.DEBUG("Creating hackathon role using factory pattern");
            HackathonRole hackathonRole = HackathonRoleFactory.create(user, hackathon, role);

            HackathonRole savedRole = hackathonRoleRepository.save(hackathonRole);
            logger.INFO("User " + user.getEmail() + " successfully joined hackathon '" + hackathon.getTitle() + "' as " + role + " with status: " + savedRole.getStatus());
            
            return savedRole;
            
        } catch (Exception e) {
            logger.ERROR("Failed to join hackathon - userId: " + userId + ", hackathonId: " + hackathonId + ", role: " + role + ", error: " + e.getMessage());
            throw e;
        }
    }

    @Override
    public void leaveHackathon(long userId, long hackathonId) {
        logger.INFO("HackathonService.leaveHackathon() - User " + userId + " leaving hackathon " + hackathonId);
        
        try {
            // 1. Make sure the link row actually exists
            HackathonRole link = hackathonRoleRepository
                    .findByUserIdAndHackathonId(userId, hackathonId)
                    .orElseThrow(() -> {
                        logger.ERROR("User " + userId + " is not enrolled in hackathon " + hackathonId);
                        return new RuntimeException("User is not enrolled in this hackathon");
                    });

            logger.DEBUG("Found hackathon role: " + link.getRole() + " for user " + userId);

            // 2. Delete every submission this user made in that event
            logger.DEBUG("Deleting user submissions for hackathon");
            submissionRepository.deleteByUserAndHackathon(userId, hackathonId);

            // 3. Delete the membership row itself
            logger.DEBUG("Deleting hackathon role");
            hackathonRoleRepository.delete(link);
            
            logger.INFO("User " + userId + " successfully left hackathon " + hackathonId);
            
        } catch (Exception e) {
            logger.ERROR("Failed to leave hackathon - userId: " + userId + ", hackathonId: " + hackathonId + ", error: " + e.getMessage());
            throw e;
        }
    }

    @Override
    public List<HackathonRole> getPendingJudgeRequests(int hackathonId) {
        logger.INFO("HackathonService.getPendingJudgeRequests() - Getting judge requests for hackathon: " + hackathonId);
        
        try {
            List<HackathonRole> judgeRequests = hackathonRoleRepository.findByHackathonIdAndRole(hackathonId, Role.JUDGE);
            logger.INFO("Found " + judgeRequests.size() + " judge requests for hackathon " + hackathonId);
            return judgeRequests;
        } catch (Exception e) {
            logger.ERROR("Failed to get judge requests for hackathon " + hackathonId + ": " + e.getMessage());
            throw e;
        }
    }

    @Override
    public List<HackathonRole> getParticipants(int hackathonId) {
        logger.INFO("HackathonService.getParticipants() - Getting participants for hackathon: " + hackathonId);
        
        try {
            List<HackathonRole> participants = hackathonRoleRepository.findByHackathonIdAndRoleAndStatus(hackathonId, Role.PARTICIPANT, ApprovalStatus.APPROVED);
            logger.INFO("Found " + participants.size() + " approved participants for hackathon " + hackathonId);
            return participants;
        } catch (Exception e) {
            logger.ERROR("Failed to get participants for hackathon " + hackathonId + ": " + e.getMessage());
            throw e;
        }
    }

    @Override
    public HackathonRole updateJudgeStatus(Long hackathonId, Long userId, ApprovalStatus status) {
        logger.INFO("HackathonService.updateJudgeStatus() - Updating judge status for user " + userId + " in hackathon " + hackathonId + " to " + status);
        
        try {
            HackathonRole roleEntry = hackathonRoleRepository.findAll().stream()
                    .filter(r -> r.getHackathon().getId().equals(hackathonId) &&
                            r.getUser().getId() == userId &&
                            r.getRole() == Role.JUDGE)
                    .findFirst()
                    .orElseThrow(() -> {
                        logger.ERROR("Judge request not found for user " + userId + " in hackathon " + hackathonId);
                        return new RuntimeException("Judge request not found");
                    });

            Hackathon hackathon = hackathonRepository.findById(Math.toIntExact(hackathonId))
                    .orElseThrow(() -> {
                        logger.ERROR("Hackathon not found with ID: " + hackathonId);
                        return new RuntimeException("Hackathon not found");
                    });

            User organizer = hackathon.getOrganizer();
            User judge = userRepository.findById(userId)
                    .orElseThrow(() -> {
                        logger.ERROR("User not found with ID: " + userId);
                        return new RuntimeException("User not found");
                    });
            String judgeEmail = judge.getEmail();

            logger.DEBUG("Updating judge status from " + roleEntry.getStatus() + " to " + status);
            roleEntry.setStatus(status);

            if (status.equals(ApprovalStatus.APPROVED)) {
                logger.INFO("Judge approved - registering for notifications and sending approval message");
                
                // Register judge as observer in unified notification service
                unifiedNotificationService.registerObserver(Math.toIntExact(hackathonId), judgeEmail, organizer);
                
                // Send immediate approval notification using unified service
                String approvalMessage = "✅ Your judge application for hackathon \"" + hackathon.getTitle() + "\" has been approved! You will now receive updates about this hackathon.";
                unifiedNotificationService.sendNotification(hackathon, organizer, judgeEmail, 
                    "Judge Application Approved", approvalMessage);
                
                logger.INFO("Judge " + judgeEmail + " approved and registered for hackathon " + hackathonId + " notifications");
            } else {
                logger.DEBUG("Judge status updated to " + status + " - no additional actions taken");
            }

            HackathonRole savedRole = hackathonRoleRepository.save(roleEntry);
            logger.INFO("Judge status successfully updated for user " + userId + " in hackathon " + hackathonId);
            
            return savedRole;
            
        } catch (Exception e) {
            logger.ERROR("Failed to update judge status - hackathonId: " + hackathonId + ", userId: " + userId + ", status: " + status + ", error: " + e.getMessage());
            throw e;
        }
    }

    @Override
    public List<Submission> getLeaderboard(Long hackathonId) {
        logger.INFO("HackathonService.getLeaderboard() - Getting leaderboard for hackathon: " + hackathonId);
        
        try {
            Hackathon hackathon = hackathonRepository.findById(Math.toIntExact(hackathonId))
                    .orElseThrow(() -> {
                        logger.ERROR("Hackathon not found with ID: " + hackathonId);
                        return new RuntimeException("Hackathon not found");
                    });
            
            String status = hackathon.getStatus();
            logger.DEBUG("Hackathon status: " + status + " - determining appropriate scoreboard template");

            ScoreboardTemplate scoreboard;
            if (status.equals("Draft") || status.equals("Published")) {
                logger.DEBUG("Using BuildPhaseScoreboard for status: " + status);
                scoreboard = applicationContext.getBean(BuildPhaseScoreboard.class);
            } else {
                logger.DEBUG("Using JudgingPhaseScoreboard for status: " + status);
                scoreboard = applicationContext.getBean(JudgingPhaseScoreboard.class);
            }

            List<Submission> leaderboard = scoreboard.generate(hackathonId);
            logger.INFO("Generated leaderboard with " + leaderboard.size() + " submissions for hackathon " + hackathonId);
            
            return leaderboard;
            
        } catch (Exception e) {
            logger.ERROR("Failed to get leaderboard for hackathon " + hackathonId + ": " + e.getMessage());
            throw e;
        }
    }
}
