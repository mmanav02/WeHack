package com.we.hack.service.ObserverNotification;

import com.we.hack.model.ApprovalStatus;
import com.we.hack.model.Hackathon;
import com.we.hack.model.HackathonRole;
import com.we.hack.model.Role;
import com.we.hack.model.User;
import com.we.hack.service.adapter.MailServiceAdapter;
import com.we.hack.service.decorator.EmailNotifier;
import com.we.hack.service.decorator.Notifier;
import com.we.hack.service.decorator.SlackNotifierDecorator;
import com.we.hack.service.factory.MailServiceAdapterFactory;
import com.we.hack.service.logger.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class UnifiedNotificationService implements NotificationService {

    private static Logger logger;
    
    static {
        try {
            logger = Logger.getInstance(100);
        } catch (IOException e) {
            System.err.println("Failed to initialize logger: " + e.getMessage());
        }
    }

    @Autowired
    private MailServiceAdapterFactory mailServiceAdapterFactory;
    
    @Autowired
    private ApplicationContext applicationContext;

    // Observer registry: hackathonId -> List of HackathonRole (approved observers)
    private final Map<Integer, List<HackathonRole>> observerRegistry = new ConcurrentHashMap<>();
    
    /**
     * Enhanced Observer that uses Decorator Pattern for notifications
     * This replaces the old JudgeNotifier class from the observer package with better functionality
     */
    private class DecoratorEnhancedObserver implements HackathonObserver {
        private final HackathonRole hackathonRole;
        private final Hackathon hackathon;
        
        public DecoratorEnhancedObserver(HackathonRole hackathonRole, Hackathon hackathon) {
            this.hackathonRole = hackathonRole;
            this.hackathon = hackathon;
            if (logger != null) {
                logger.DEBUG("Created DecoratorEnhancedObserver for role: " + hackathonRole.getRole() + 
                           ", user: " + hackathonRole.getUser().getEmail() + 
                           ", hackathon: " + hackathon.getTitle());
            }
        }
        
        @Override
        public void update(String message) {
            if (logger != null) {
                logger.DEBUG("DecoratorEnhancedObserver.update() - Sending notification to: " + 
                           hackathonRole.getUser().getEmail() + " (role: " + hackathonRole.getRole() + ")");
            }
            
            // Only send notifications to approved users
            if (hackathonRole.getStatus() != ApprovalStatus.APPROVED) {
                if (logger != null) {
                    logger.WARN("Skipping notification for non-approved user: " + hackathonRole.getUser().getEmail() + 
                               " (status: " + hackathonRole.getStatus() + ")");
                }
                return;
            }
            
            // Use decorator pattern to send notification through multiple channels
            sendNotification(hackathon, hackathon.getOrganizer(), hackathonRole.getUser().getEmail(), 
                           "Hackathon Update", message);
        }
    }

    @Override
    public void sendNotification(Hackathon hackathon, User organizer, String recipient, 
                                String subject, String content) {
        if (logger != null) {
            logger.INFO("UnifiedNotificationService.sendNotification() - Sending notification to: " + recipient);
            logger.DEBUG("Parameters: hackathon=" + hackathon.getTitle() + ", subject=" + subject + ", organizer=" + organizer.getEmail());
            logger.DEBUG("Hackathon MailMode: " + hackathon.getMailMode() + ", Slack enabled: " + hackathon.isSlackEnabled());
        }
        
        try {
            if (logger != null) {
                logger.DEBUG("Creating MailServiceAdapter using factory for MailMode: " + hackathon.getMailMode());
            }
            MailServiceAdapter mailServiceAdapter = mailServiceAdapterFactory.createAdapter(hackathon);

            if (logger != null) {
                logger.DEBUG("Creating base EmailNotifier with adapter: " + mailServiceAdapter.getClass().getSimpleName());
            }
            Notifier notifier = new EmailNotifier(mailServiceAdapter);

            if (hackathon.isSlackEnabled()) {
                try {
                    if (logger != null) {
                        logger.DEBUG("Applying Slack decorator - Slack notifications enabled for hackathon: " + hackathon.getTitle());
                    }
                    SlackNotifierDecorator slackDecorator = applicationContext.getBean(SlackNotifierDecorator.class);
                    slackDecorator.setWrappee(notifier);
                    notifier = slackDecorator;
                    if (logger != null) {
                        logger.INFO("Slack decorator applied successfully for hackathon: " + hackathon.getTitle());
                    }
                } catch (Exception e) {
                    if (logger != null) {
                        logger.ERROR("Failed to initialize Slack decorator: " + e.getMessage());
                        logger.WARN("Continuing with email-only notification");
                    }
                }
            } else {
                if (logger != null) {
                    logger.DEBUG("Slack notifications disabled for hackathon: " + hackathon.getTitle());
                }
            }

            if (logger != null) {
                logger.DEBUG("Sending notification through decorator chain using " + notifier.getClass().getSimpleName());
            }
            notifier.notify(organizer, recipient, subject, content);
            if (logger != null) {
                logger.INFO("Notification sent successfully to: " + recipient + " for hackathon: " + hackathon.getTitle() + " using MailMode: " + hackathon.getMailMode());
            }
            
        } catch (Exception e) {
            if (logger != null) {
                logger.ERROR("Failed to send notification - recipient: " + recipient + ", hackathon: " + hackathon.getId() + ", mailMode: " + hackathon.getMailMode() + ", error: " + e.getMessage());
                logger.SEVERE("Stack trace: " + e.toString());
            }
            throw e;
        }
    }

    @Override
    public void broadcastNotification(int hackathonId, Hackathon hackathon, 
                                     String subject, String content) {
        if (logger != null) {
            logger.INFO("UnifiedNotificationService.broadcastNotification() - Broadcasting to observers for hackathon: " + hackathonId);
            logger.DEBUG("Parameters: subject=" + subject + ", hackathon=" + hackathon.getTitle() + ", mailMode=" + hackathon.getMailMode());
        }
        
        try {
            List<HackathonRole> observers = observerRegistry.getOrDefault(hackathonId, Collections.emptyList());
            
            // Filter only approved observers
            List<HackathonRole> approvedObservers = observers.stream()
                    .filter(role -> role.getStatus() == ApprovalStatus.APPROVED)
                    .collect(Collectors.toList());
            
            if (approvedObservers.isEmpty()) {
                if (logger != null) {
                    logger.WARN("No approved observers registered for hackathon " + hackathonId + " - skipping broadcast");
                }
                return;
            }
            
            if (logger != null) {
                logger.INFO("Broadcasting to " + approvedObservers.size() + " approved observers for hackathon: " + 
                           hackathon.getTitle() + " using MailMode: " + hackathon.getMailMode() + 
                           " (total registered: " + observers.size() + ")");
            }

            int successCount = 0;
            for (HackathonRole role : approvedObservers) {
                try {
                    if (logger != null) {
                        logger.DEBUG("Creating DecoratorEnhancedObserver for: " + role.getUser().getEmail() + 
                                   " (role: " + role.getRole() + ")");
                    }
                    DecoratorEnhancedObserver observer = new DecoratorEnhancedObserver(role, hackathon);
                    observer.update(content);
                    successCount++;
                } catch (Exception e) {
                    if (logger != null) {
                        logger.ERROR("Failed to notify observer: " + role.getUser().getEmail() + ", error: " + e.getMessage());
                    }
                }
            }
            
            if (logger != null) {
                logger.INFO("Broadcast complete for hackathon " + hackathonId + " - " + successCount + "/" + 
                           approvedObservers.size() + " notifications sent successfully using MailMode: " + hackathon.getMailMode());
            }
            
        } catch (Exception e) {
            if (logger != null) {
                logger.ERROR("Failed to broadcast notification - hackathonId: " + hackathonId + ", error: " + e.getMessage());
                logger.SEVERE("Stack trace: " + e.toString());
            }
            throw e;
        }
    }

    /**
     * Register a HackathonRole as an observer for notifications
     * This replaces the old registerObserver method to use proper domain objects
     */
    public void registerObserver(HackathonRole hackathonRole) {
        if (logger != null) {
            logger.INFO("UnifiedNotificationService.registerObserver() - Registering observer: " + 
                       hackathonRole.getUser().getEmail() + " (role: " + hackathonRole.getRole() + 
                       ") for hackathon: " + hackathonRole.getHackathon().getId());
            logger.DEBUG("Approval status: " + hackathonRole.getStatus());
        }
        
        try {
            int hackathonId = Math.toIntExact(hackathonRole.getHackathon().getId());
            
            // Check if observer is already registered
            List<HackathonRole> existingObservers = observerRegistry.getOrDefault(hackathonId, Collections.emptyList());
            boolean alreadyRegistered = existingObservers.stream()
                    .anyMatch(role -> Objects.equals(role.getUser().getId(), hackathonRole.getUser().getId()) &&
                                    role.getRole() == hackathonRole.getRole());
            
            if (alreadyRegistered) {
                if (logger != null) {
                    logger.WARN("Observer " + hackathonRole.getUser().getEmail() + " with role " + 
                               hackathonRole.getRole() + " is already registered for hackathon " + hackathonId);
                }
                return;
            }
            
            observerRegistry.computeIfAbsent(hackathonId, k -> new ArrayList<>()).add(hackathonRole);
            
            int totalObservers = observerRegistry.get(hackathonId).size();
            if (logger != null) {
                logger.INFO("Observer " + hackathonRole.getUser().getEmail() + " (" + hackathonRole.getRole() + 
                           ") registered successfully for hackathon " + hackathonId + " (total: " + totalObservers + ")");
            }
            
        } catch (Exception e) {
            if (logger != null) {
                logger.ERROR("Failed to register observer - user: " + hackathonRole.getUser().getEmail() + 
                           ", hackathon: " + hackathonRole.getHackathon().getId() + ", error: " + e.getMessage());
            }
            throw e;
        }
    }

    /**
     * Legacy method for backward compatibility
     */
    @Override
    public void registerObserver(int hackathonId, String observerEmail, User organizer) {
        if (logger != null) {
            logger.WARN("Using legacy registerObserver method. Consider using registerObserver(HackathonRole) instead.");
        }
        // This method is kept for backward compatibility but logs a warning
        // In practice, observers should be registered using the HackathonRole method
    }

    @Override
    public List<String> getObservers(int hackathonId) {
        if (logger != null) {
            logger.DEBUG("UnifiedNotificationService.getObservers() - Getting observers for hackathon: " + hackathonId);
        }
        
        try {
            List<String> observers = observerRegistry.getOrDefault(hackathonId, Collections.emptyList())
                                  .stream()
                                  .filter(role -> role.getStatus() == ApprovalStatus.APPROVED)
                                  .map(role -> role.getUser().getEmail())
                                  .collect(Collectors.toList());
            
            if (logger != null) {
                logger.DEBUG("Found " + observers.size() + " approved observers for hackathon " + hackathonId);
            }
            return observers;
            
        } catch (Exception e) {
            if (logger != null) {
                logger.ERROR("Failed to get observers for hackathon " + hackathonId + ": " + e.getMessage());
            }
            throw e;
        }
    }

    /**
     * Get observers by role for a hackathon
     */
    public List<HackathonRole> getObserversByRole(int hackathonId, Role role) {
        if (logger != null) {
            logger.DEBUG("UnifiedNotificationService.getObserversByRole() - Getting " + role + 
                        " observers for hackathon: " + hackathonId);
        }
        
        try {
            List<HackathonRole> observers = observerRegistry.getOrDefault(hackathonId, Collections.emptyList())
                                  .stream()
                                  .filter(hackathonRole -> hackathonRole.getRole() == role && 
                                                          hackathonRole.getStatus() == ApprovalStatus.APPROVED)
                                  .collect(Collectors.toList());
            
            if (logger != null) {
                logger.DEBUG("Found " + observers.size() + " approved " + role + " observers for hackathon " + hackathonId);
            }
            return observers;
            
        } catch (Exception e) {
            if (logger != null) {
                logger.ERROR("Failed to get " + role + " observers for hackathon " + hackathonId + ": " + e.getMessage());
            }
            throw e;
        }
    }
    
    /**
     * Clear observers for a hackathon (useful for cleanup)
     */
    public void clearObservers(int hackathonId) {
        if (logger != null) {
            logger.INFO("UnifiedNotificationService.clearObservers() - Clearing observers for hackathon: " + hackathonId);
        }
        
        try {
            List<HackathonRole> removed = observerRegistry.remove(hackathonId);
            int removedCount = removed != null ? removed.size() : 0;
            if (logger != null) {
                logger.INFO("Cleared " + removedCount + " observers for hackathon " + hackathonId);
            }
            
        } catch (Exception e) {
            if (logger != null) {
                logger.ERROR("Failed to clear observers for hackathon " + hackathonId + ": " + e.getMessage());
            }
            throw e;
        }
    }
    
    /**
     * Get observer count for a hackathon
     */
    public int getObserverCount(int hackathonId) {
        if (logger != null) {
            logger.DEBUG("UnifiedNotificationService.getObserverCount() - Getting observer count for hackathon: " + hackathonId);
        }
        
        try {
            int count = (int) observerRegistry.getOrDefault(hackathonId, Collections.emptyList())
                    .stream()
                    .filter(role -> role.getStatus() == ApprovalStatus.APPROVED)
                    .count();
            
            if (logger != null) {
                logger.DEBUG("Approved observer count for hackathon " + hackathonId + ": " + count);
            }
            return count;
            
        } catch (Exception e) {
            if (logger != null) {
                logger.ERROR("Failed to get observer count for hackathon " + hackathonId + ": " + e.getMessage());
            }
            throw e;
        }
    }
} 