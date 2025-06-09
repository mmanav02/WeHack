package com.we.hack.service.impl;

import com.we.hack.dto.SubmissionDto;
import com.we.hack.mapper.SubmissionMapper;
import com.we.hack.model.Hackathon;
import com.we.hack.model.Submission;
import com.we.hack.model.Team;
import com.we.hack.model.User;
import com.we.hack.repository.HackathonRepository;
import com.we.hack.repository.SubmissionRepository;
import com.we.hack.repository.TeamRepository;
import com.we.hack.repository.UserRepository;
import com.we.hack.service.SubmissionService;
import com.we.hack.service.adapter.MailServiceAdapter;
import com.we.hack.service.builder.Submission.SubmissionBuilder;
import com.we.hack.service.builder.Submission.ConcreteSubmissionBuilder;
import com.we.hack.service.iterator.CollectionFactory;
import com.we.hack.service.iterator.Iterator;
import com.we.hack.service.decorator.EmailNotifier;
import com.we.hack.service.decorator.Notifier;
import com.we.hack.service.decorator.SlackNotifierDecorator;
import com.we.hack.service.logger.Logger;
import com.we.hack.service.memento.SubmissionHistoryManager;
import com.we.hack.service.memento.SubmissionMemento;
import com.we.hack.service.notification.UnifiedNotificationService;
import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.Instant;
import java.util.*;
import java.util.ArrayList;
import java.util.List;

@Service
public class SubmissionServiceImpl implements SubmissionService {

    private static Logger logger;
    
    static {
        try {
            logger = Logger.getInstance(100);
        } catch (IOException e) {
            System.err.println("Failed to initialize logger: " + e.getMessage());
        }
    }

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private HackathonRepository hackathonRepository;

    @Autowired
    private SubmissionHistoryManager submissionHistoryManager;

    @Autowired
    private CollectionFactory collectionFactory;

    @Autowired
    private MailServiceAdapter mailServiceAdapter;

    @Autowired
    private ApplicationContext context;

    @Autowired
    private UnifiedNotificationService unifiedNotificationService;

    // This is only for builder pattern so not in the SubmissionService Interface and so now Overridden
    @Transactional
    public Submission createFinalSubmission(SubmissionBuilder builder,
                                            Long userId,
                                            int hackathonId,
                                            MultipartFile file)
            throws RuntimeException {
        logger.INFO("SubmissionService.createFinalSubmission() - Creating submission for user " + userId + " in hackathon " + hackathonId);
        logger.DEBUG("Parameters: hasFile=" + (file != null && !file.isEmpty()) + ", fileSize=" + (file != null ? file.getSize() : 0));
        
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

            Team team = teamRepository.findFirstByUsers_Id(userId)
                    .orElseThrow(() -> {
                        logger.ERROR("User " + userId + " is not in any team");
                        return new IllegalArgumentException("User is not in any team");
                    });

            logger.DEBUG("Found team: " + team.getName() + " (ID: " + team.getId() + ") for user " + user.getEmail());

            // Use Builder pattern for consistent construction
            Submission submission = builder
                    .team(team)
                    .setSubmitTime()
                    .setUser(user)
                    .setHackathon(hackathon)
                    .build();

            logger.DEBUG("Built submission using builder pattern: " + submission.getTitle());

            // Handle file upload if present
            if (file != null && !file.isEmpty()) {
                logger.INFO("Processing file upload: " + file.getOriginalFilename());
                try {
                    String uploadDir = System.getProperty("user.dir") + "/uploads/";
                    File dir = new File(uploadDir);
                    if (!dir.exists()) {
                        logger.DEBUG("Creating uploads directory");
                        dir.mkdirs();
                    }

                    String path = uploadDir + System.currentTimeMillis() + "_" + file.getOriginalFilename();
                    file.transferTo(new File(path));
                    submission.setFilePath("uploads/" + new File(path).getName());
                    logger.DEBUG("File uploaded successfully to: " + submission.getFilePath());
                } catch (IOException e) {
                    logger.ERROR("File upload failed: " + e.getMessage());
                    throw new RuntimeException("File upload failed", e);
                }
            } else {
                logger.DEBUG("No file provided with submission");
            }

            // Validate submission
            logger.DEBUG("Validating submission");
            validateSubmission(userId, hackathonId, submission, file);

            // Save submission
            submission = submissionRepository.save(submission);
            logger.INFO("Submission saved with ID: " + submission.getId());

            // Update team with submission
            team.setSubmission(submission);
            teamRepository.save(team);
            logger.DEBUG("Team updated with submission reference");

            // Create memento for history management
            submissionHistoryManager.push(team.getId(), submission.createMemento());
            logger.DEBUG("Submission memento created for team " + team.getId());

            logger.INFO("Final submission created successfully for user " + userId + " in hackathon " + hackathonId);
            return submission;

        } catch (Exception e) {
            logger.ERROR("Failed to create final submission - userId: " + userId + ", hackathonId: " + hackathonId + ", error: " + e.getMessage());
            logger.SEVERE("Stack trace: " + e.toString());
            throw e;
        }
    }

    @Override
    public List<SubmissionDto> listSubmissions(Hackathon hackathon, Team team){
        logger.INFO("SubmissionService.listSubmissions() - Listing submissions for team " + team.getName() + " in hackathon " + hackathon.getTitle());
        
        try {
            Iterator<Submission> it = collectionFactory.submissions(team, hackathon).createIterator();
            List<SubmissionDto> result = new ArrayList<>();
            int count = 0;
            
            while (it.hasNext()) {
                result.add(SubmissionMapper.toDto(it.next()));
                count++;
            }
            
            logger.INFO("Retrieved " + count + " submissions for team " + team.getId() + " using iterator pattern");
            return result;
        } catch (Exception e) {
            logger.ERROR("Failed to list submissions for team " + team.getId() + " in hackathon " + hackathon.getId() + ": " + e.getMessage());
            throw e;
        }
    }

    @Override
    public Submission saveSubmission(Long userId, int hackathonId, Submission submission) {
        logger.INFO("SubmissionService.saveSubmission() - Saving submission for user " + userId + " in hackathon " + hackathonId);
        logger.DEBUG("Submission title: " + submission.getTitle());
        
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

            Team team = teamRepository.findFirstByUsers_Id(userId)
                    .orElseThrow(() -> {
                        logger.ERROR("User " + userId + " is not in any team");
                        return new IllegalArgumentException("User is not in any team");
                    });

            logger.DEBUG("Setting submission relationships: user=" + user.getEmail() + ", team=" + team.getName() + ", hackathon=" + hackathon.getTitle());

            submission.setUser(user);
            submission.setHackathon(hackathon);
            submission.setTeam(team);

            team.setSubmission(submission);
            teamRepository.save(team);

            Submission savedSubmission = submissionRepository.save(submission);
            logger.INFO("Submission saved successfully with ID: " + savedSubmission.getId());
            
            return savedSubmission;
            
        } catch (Exception e) {
            logger.ERROR("Failed to save submission - userId: " + userId + ", hackathonId: " + hackathonId + ", error: " + e.getMessage());
            throw e;
        }
    }

    @Override
    public Submission validateSubmission(Long userId, int hackathonId, Submission submission, MultipartFile file) {
        logger.DEBUG("SubmissionService.validateSubmission() - Validating submission for user " + userId + " in hackathon " + hackathonId);
        // Not responsible for validation, so just return back
        // validation implemented by proxy
        logger.DEBUG("Validation passed through to proxy pattern implementation");
        return submission;
    }

    @Override
    public Submission editSubmission(int hackathonId, Long userId, Long submissionId, String title, String description, String projectUrl, MultipartFile file) {
        logger.INFO("SubmissionService.editSubmission() - Editing submission " + submissionId + " for user " + userId + " in hackathon " + hackathonId);
        logger.DEBUG("New values: title=" + title + ", hasNewFile=" + (file != null && !file.isEmpty()) + ", projectUrl=" + (projectUrl != null ? projectUrl : "null"));
        
        try {
            Submission oldSubmission = submissionRepository.findById(submissionId)
                    .orElseThrow(() -> {
                        logger.ERROR("Submission not found with ID: " + submissionId);
                        return new RuntimeException("Submission not found");
                    });

            // Optional: Validate that submission belongs to user and hackathon
            if (!(oldSubmission.getHackathon().getId() == hackathonId)) {
                logger.ERROR("Submission " + submissionId + " does not belong to hackathon " + hackathonId);
                throw new RuntimeException("Submission does not belong to this hackathon");
            }

            Team team = oldSubmission.getTeam();
            logger.DEBUG("Found existing submission: " + oldSubmission.getTitle() + " for team " + team.getName());

            // Check membership in the team
            Long teamId = team.getId();
            if (!teamRepository.existsByIdAndUsers_Id(teamId, userId)) {
                logger.ERROR("User " + userId + " is not a member of team " + teamId);
                throw new RuntimeException("User is not a member of this team");
            }

            logger.DEBUG("User membership verified for team " + teamId);

            // Use Builder pattern for consistent construction and validation
            logger.DEBUG("Building updated submission using builder pattern");
            SubmissionBuilder builder = new ConcreteSubmissionBuilder()
                    .title(title)
                    .description(description)
                    .projectUrl(projectUrl)
                    .setSubmitTime()
                    .setUser(oldSubmission.getUser())
                    .setHackathon(oldSubmission.getHackathon())
                    .team(team);

            Submission submissionNew = builder.build();

            // Handle file upload
            if (file != null && !file.isEmpty()) {
                logger.INFO("Processing new file upload for submission edit: " + file.getOriginalFilename());
                try {
                    String uploadDir = System.getProperty("user.dir") + "/uploads/";
                    File directory = new File(uploadDir);
                    if (!directory.exists()) {
                        logger.DEBUG("Creating uploads directory");
                        directory.mkdirs();
                    }

                    String filePath = uploadDir + System.currentTimeMillis() + "_" + file.getOriginalFilename();
                    file.transferTo(new File(filePath));
                    submissionNew.setFilePath(filePath);
                    logger.DEBUG("New file uploaded successfully to: " + filePath);
                } catch (IOException e) {
                    logger.ERROR("Failed to upload file during edit: " + e.getMessage());
                    throw new RuntimeException("Failed to upload file", e);
                }
            } else {
                // Preserve existing file path if no new file uploaded
                submissionNew.setFilePath(oldSubmission.getFilePath());
                logger.DEBUG("Preserving existing file path: " + oldSubmission.getFilePath());
            }

            // Set the ID to update existing submission
            submissionNew.setId(submissionId);

            submissionNew = submissionRepository.save(submissionNew);
            logger.INFO("Submission " + submissionId + " updated successfully");

            team.setSubmission(submissionNew);
            teamRepository.save(team);
            logger.DEBUG("Team updated with new submission reference");

            validateSubmission(userId, hackathonId, submissionNew, file);

            // Create memento for history
            submissionHistoryManager.push(submissionNew.getTeam().getId(), submissionNew.createMemento());
            logger.DEBUG("New memento created for submission history");

            logger.INFO("Submission edit completed successfully for submission " + submissionId);
            return submissionNew;
            
        } catch (Exception e) {
            logger.ERROR("Failed to edit submission - submissionId: " + submissionId + ", userId: " + userId + ", hackathonId: " + hackathonId + ", error: " + e.getMessage());
            throw e;
        }
    }

    @Transactional
    public Submission undoLastEdit(Long teamId, Long submissionId, Long hackathonId) {
        logger.INFO("SubmissionService.undoLastEdit() - Undoing last edit for submission " + submissionId + " in team " + teamId);
        
        try {
            Submission submission = submissionRepository.findById(submissionId)
                    .orElseThrow(() -> {
                        logger.ERROR("Submission not found with ID: " + submissionId);
                        return new RuntimeException("Submission not found");
                    });

            Team team = submission.getTeam();
            if (!team.getId().equals(teamId)) {
                logger.ERROR("Submission " + submissionId + " does not belong to team " + teamId);
                throw new RuntimeException("Submission does not belong to this team");
            }

            if (!submission.getHackathon().getId().equals(hackathonId)) {
                logger.ERROR("Submission " + submissionId + " does not belong to hackathon " + hackathonId);
                throw new RuntimeException("Submission does not belong to this hackathon");
            }

            logger.DEBUG("Validation passed - retrieving memento from history");

            SubmissionMemento memento = submissionHistoryManager.pop(teamId)
                    .orElseThrow(() -> {
                        logger.WARN("No history available to undo for team " + teamId);
                        return new RuntimeException("No history to undo");
                    });

            logger.DEBUG("Retrieved memento from history - restoring submission state");
            submission.restore(memento);
            Submission saved = submissionRepository.save(submission);

            team.setSubmission(saved);
            teamRepository.save(team);

            logger.INFO("Successfully undid last edit for submission " + submissionId + " in team " + teamId);
            return saved;
            
        } catch (Exception e) {
            logger.ERROR("Failed to undo last edit - submissionId: " + submissionId + ", teamId: " + teamId + ", hackathonId: " + hackathonId + ", error: " + e.getMessage());
            throw e;
        }
    }

    /**
     * Enhanced notifyOrganizer method using Unified Notification Service
     * Now supports both Decorator (multi-channel) and Observer (broadcasting) patterns
     */
    public void notifyOrganizer(Hackathon hackathon, User organizer, List<String> recipients, String subject, String content) {
        logger.INFO("SubmissionService.notifyOrganizer() - Notifying organizer about submission using unified notification service");
        logger.DEBUG("Recipients count: " + recipients.size() + ", subject: " + subject + ", hackathon: " + hackathon.getTitle());
        
        try {
            // Send individual notifications using decorator pattern (Email + Slack if enabled)
            for (String recipient : recipients) {
                logger.DEBUG("Sending notification to: " + recipient);
                unifiedNotificationService.sendNotification(hackathon, organizer, recipient, subject, content);
            }
            
            // Also send to organizer using decorator pattern
            logger.DEBUG("Sending notification to organizer: " + organizer.getEmail());
            unifiedNotificationService.sendNotification(hackathon, organizer, organizer.getEmail(), subject, content);
            
            logger.INFO("Organizer notification complete for " + recipients.size() + " recipients using unified notification service");
            
        } catch (Exception e) {
            logger.ERROR("Failed to notify organizer - hackathon: " + hackathon.getId() + ", recipientCount: " + recipients.size() + ", error: " + e.getMessage());
            throw e;
        }
    }
    
    /**
     * NEW: Enhanced method to broadcast submission notifications to all observers
     * Useful for major submission events (e.g., submission deadline reminders, new submissions)
     */
    public void broadcastSubmissionUpdate(Hackathon hackathon, String subject, String content) {
        logger.INFO("SubmissionService.broadcastSubmissionUpdate() - Broadcasting submission update for hackathon: " + hackathon.getTitle());
        logger.DEBUG("Subject: " + subject);
        
        try {
            int hackathonId = Math.toIntExact(hackathon.getId());
            unifiedNotificationService.broadcastNotification(hackathonId, hackathon, subject, content);
            logger.INFO("Successfully broadcasted submission update for hackathon: " + hackathon.getTitle());
            
        } catch (Exception e) {
            logger.ERROR("Failed to broadcast submission update - hackathon: " + hackathon.getId() + ", error: " + e.getMessage());
            throw e;
        }
    }

    @Override
    public List<Submission> findByHackathonId(int hackathonId) {
        logger.INFO("SubmissionService.findByHackathonId() - Finding submissions for hackathon: " + hackathonId);
        
        try {
            List<Submission> submissions = submissionRepository.findByHackathonId(hackathonId);
            logger.INFO("Found " + submissions.size() + " submissions for hackathon " + hackathonId);
            return submissions;
        } catch (Exception e) {
            logger.ERROR("Failed to find submissions for hackathon " + hackathonId + ": " + e.getMessage());
            throw e;
        }
    }

    @Override
    public Submission findById(Long submissionId) {
        logger.INFO("SubmissionService.findById() - Finding submission: " + submissionId);
        
        try {
            Submission submission = submissionRepository.findById(submissionId).orElse(null);
            if (submission != null) {
                logger.DEBUG("Found submission: " + submission.getTitle());
            } else {
                logger.WARN("Submission not found with ID: " + submissionId);
            }
            return submission;
        } catch (Exception e) {
            logger.ERROR("Failed to find submission " + submissionId + ": " + e.getMessage());
            throw e;
        }
    }

    @Override
    public List<Submission> findByUserId(Long userId) {
        logger.INFO("SubmissionService.findByUserId() - Finding submissions for user: " + userId);
        
        try {
            List<Submission> submissions = submissionRepository.findByUserId(userId);
            logger.INFO("Found " + submissions.size() + " submissions for user " + userId);
            return submissions;
        } catch (Exception e) {
            logger.ERROR("Failed to find submissions for user " + userId + ": " + e.getMessage());
            throw e;
        }
    }

    @Override
    @Transactional
    public Submission setPrimarySubmission(Long submissionId, Long userId) {
        logger.INFO("SubmissionService.setPrimarySubmission() - Setting submission " + submissionId + " as primary for user " + userId);
        
        try {
            Submission submission = submissionRepository.findById(submissionId)
                    .orElseThrow(() -> {
                        logger.ERROR("Submission not found with ID: " + submissionId);
                        return new RuntimeException("Submission not found");
                    });
            
            // Verify user is part of the team
            Team team = submission.getTeam();
            if (!teamRepository.existsByIdAndUsers_Id(team.getId(), userId)) {
                logger.ERROR("User " + userId + " is not a member of team " + team.getId());
                throw new RuntimeException("User is not a member of this team");
            }
            
            // Check hackathon status
            Hackathon hackathon = submission.getHackathon();
            if ("Judging".equals(hackathon.getStatus()) || "Completed".equals(hackathon.getStatus())) {
                logger.ERROR("Cannot set primary submission during " + hackathon.getStatus().toLowerCase() + " phase");
                throw new RuntimeException("Cannot set primary submission during " + hackathon.getStatus().toLowerCase() + " phase");
            }
            
            logger.DEBUG("Clearing existing primary submission for team " + team.getId() + " in hackathon " + hackathon.getId());
            
            // Clear existing primary for this team
            submissionRepository.clearPrimaryForTeamInHackathon(team.getId(), hackathon.getId());
            
            // Set this submission as primary
            submission.setPrimary(true);
            Submission savedSubmission = submissionRepository.save(submission);
            
            logger.INFO("Successfully set submission " + submissionId + " as primary for team " + team.getId() + " in hackathon " + hackathon.getId());
            return savedSubmission;
            
        } catch (Exception e) {
            logger.ERROR("Failed to set primary submission - submissionId: " + submissionId + ", userId: " + userId + ", error: " + e.getMessage());
            throw e;
        }
    }

    @Override
    public List<Submission> getPrimarySubmissionsByHackathon(int hackathonId) {
        logger.INFO("SubmissionService.getPrimarySubmissionsByHackathon() - Getting primary submissions for hackathon: " + hackathonId);
        
        try {
            List<Submission> primarySubmissions = submissionRepository.findByHackathonIdAndIsPrimaryTrue(hackathonId);
            logger.INFO("Found " + primarySubmissions.size() + " primary submissions for hackathon " + hackathonId);
            return primarySubmissions;
        } catch (Exception e) {
            logger.ERROR("Failed to get primary submissions for hackathon " + hackathonId + ": " + e.getMessage());
            throw e;
        }
    }
} 