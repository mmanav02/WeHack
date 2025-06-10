package com.we.hack.service.ObserverNotification;

import com.we.hack.model.Hackathon;
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

    private final Map<Integer, List<ObserverEntry>> observerRegistry = new ConcurrentHashMap<>();

    
    /**
     * Enhanced Observer that uses Decorator Pattern for notifications
     * This replaces the old JudgeNotifier class from the observer package with better functionality
     */
    private class DecoratorEnhancedObserver implements HackathonObserver {
        private final ObserverEntry observerEntry;
        private final Hackathon hackathon;
        
        public DecoratorEnhancedObserver(ObserverEntry observerEntry, Hackathon hackathon) {
            this.observerEntry = observerEntry;
            this.hackathon = hackathon;
            if (logger != null) {
                logger.DEBUG("Created DecoratorEnhancedObserver for role: " + observerEntry.getRole() + 
                           ", user: " + observerEntry.getEmail() + 
                           ", hackathon: " + hackathon.getTitle());
            }
        }
        
        @Override
        public void update(String message) {
            if (logger != null) {
                logger.DEBUG("DecoratorEnhancedObserver.update() - Sending notification to: " + 
                           observerEntry.getEmail() + " (role: " + observerEntry.getRole() + ")");
            }
            
            // Use decorator pattern to send notification through multiple channels
            sendNotification(hackathon, observerEntry.getOrganizer(), observerEntry.getEmail(), 
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
            List<ObserverEntry> observers = observerRegistry.getOrDefault(hackathonId, Collections.emptyList());
            
            if (observers.isEmpty()) {
                if (logger != null) {
                    logger.WARN("No observers registered for hackathon " + hackathonId + " - skipping broadcast");
                }
                return;
            }
            
            if (logger != null) {
                logger.INFO("Broadcasting to " + observers.size() + " observers for hackathon: " + 
                           hackathon.getTitle() + " using MailMode: " + hackathon.getMailMode());
            }

            int successCount = 0;
            for (ObserverEntry entry : observers) {
                try {
                    if (logger != null) {
                        logger.DEBUG("Creating DecoratorEnhancedObserver for: " + entry.getEmail() + 
                                   " (role: " + entry.getRole() + ")");
                    }
                    DecoratorEnhancedObserver observer = new DecoratorEnhancedObserver(entry, hackathon);
                    observer.update(content);
                    successCount++;
                } catch (Exception e) {
                    if (logger != null) {
                        logger.ERROR("Failed to notify observer: " + entry.getEmail() + ", error: " + e.getMessage());
                    }
                }
            }
            
            if (logger != null) {
                logger.INFO("Broadcast complete for hackathon " + hackathonId + " - " + successCount + "/" + 
                           observers.size() + " notifications sent successfully using MailMode: " + hackathon.getMailMode());
            }
            
        } catch (Exception e) {
            if (logger != null) {
                logger.ERROR("Failed to broadcast notification - hackathonId: " + hackathonId + ", error: " + e.getMessage());
                logger.SEVERE("Stack trace: " + e.toString());
            }
            throw e;
        }
    }

    @Override
    public void registerObserver(int hackathonId, String observerEmail, User organizer) {
        if (logger != null) {
            logger.INFO("UnifiedNotificationService.registerObserver() - Registering observer: " + observerEmail + 
                       " for hackathon: " + hackathonId);
            logger.DEBUG("Organizer: " + organizer.getEmail());
            logger.DEBUG("Current state of observerRegistry: " + observerRegistry);
        }
        
        try {
            // Create ObserverEntry and call the main registration method
            ObserverEntry observerEntry = new ObserverEntry(observerEmail, organizer, "OBSERVER");
            registerObserver(hackathonId, observerEntry);
            
        } catch (Exception e) {
            if (logger != null) {
                logger.ERROR("Failed to register observer - email: " + observerEmail + 
                           ", hackathonId: " + hackathonId + ", error: " + e.getMessage());
                logger.SEVERE("Stack trace: " + e.toString());
            }
            throw e;
        }
    }

    /**
     * Main registration method that takes an ObserverEntry directly
     */
    public void registerObserver(int hackathonId, ObserverEntry observerEntry) {
        if (logger != null) {
            logger.INFO("UnifiedNotificationService.registerObserver() - Registering observer entry for hackathon: " + hackathonId);
            logger.DEBUG("Observer: " + observerEntry.getEmail() + ", role: " + observerEntry.getRole());
            logger.DEBUG("Current state of observerRegistry: " + observerRegistry);
        }
        
        try {
            // Get or create the list for this hackathon
            List<ObserverEntry> observers = observerRegistry.get(hackathonId);
            if (observers == null) {
                observers = new ArrayList<>();
                observerRegistry.put(hackathonId, observers);
                if (logger != null) {
                    logger.DEBUG("Created new observer list for hackathon: " + hackathonId);
                }
            }
            
            // Check if observer is already registered
            boolean alreadyRegistered = observers.stream()
                    .anyMatch(entry -> entry.getEmail().equals(observerEntry.getEmail()));
            
            if (alreadyRegistered) {
                if (logger != null) {
                    logger.WARN("Observer " + observerEntry.getEmail() + " is already registered for hackathon " + hackathonId);
                }
                return;
            }
            
            // Debug logging before adding observer
            if (logger != null) {
                logger.DEBUG("Current observers for hackathon " + hackathonId + ": " + observers.size());
                logger.DEBUG("Adding observer entry: " + observerEntry);
            }
            
            // Add the observer entry
            observers.add(observerEntry);
            
            // Ensure the list is stored in the map
            observerRegistry.put(hackathonId, observers);
            
            // Debug logging after adding observer
            if (logger != null) {
                logger.DEBUG("Updated observers for hackathon " + hackathonId + ": " + observers.size());
                logger.DEBUG("All observers in registry: " + observerRegistry);
            }
            
            int totalObservers = observers.size();
            if (logger != null) {
                logger.INFO("Observer " + observerEntry.getEmail() + " registered successfully for hackathon " + 
                           hackathonId + " (total: " + totalObservers + ")");
            }
            
        } catch (Exception e) {
            if (logger != null) {
                logger.ERROR("Failed to register observer entry - email: " + observerEntry.getEmail() + 
                           ", hackathonId: " + hackathonId + ", error: " + e.getMessage());
                logger.SEVERE("Stack trace: " + e.toString());
            }
            throw e;
        }
    }

    @Override
    public List<String> getObservers(int hackathonId) {
        if (logger != null) {
            logger.DEBUG("UnifiedNotificationService.getObservers() - Getting observers for hackathon: " + hackathonId);
        }
        
        try {
            List<String> observers = observerRegistry.getOrDefault(hackathonId, Collections.emptyList())
                                  .stream()
                                  .map(ObserverEntry::getEmail)
                                  .toList();
            
            if (logger != null) {
                logger.DEBUG("Found " + observers.size() + " observers for hackathon " + hackathonId);
            }
            return observers;
            
        } catch (Exception e) {
            if (logger != null) {
                logger.ERROR("Failed to get observers for hackathon " + hackathonId + ": " + e.getMessage());
            }
            throw e;
        }
    }
    
    public void clearObservers(int hackathonId) {
        if (logger != null) {
            logger.INFO("UnifiedNotificationService.clearObservers() - Clearing observers for hackathon: " + hackathonId);
        }
        
        try {
            List<ObserverEntry> removed = observerRegistry.remove(hackathonId);
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
    
    public int getObserverCount(int hackathonId) {
        if (logger != null) {
            logger.DEBUG("UnifiedNotificationService.getObserverCount() - Getting observer count for hackathon: " + hackathonId);
        }
        
        try {
            int count = observerRegistry.getOrDefault(hackathonId, Collections.emptyList()).size();
            
            if (logger != null) {
                logger.DEBUG("Observer count for hackathon " + hackathonId + ": " + count);
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