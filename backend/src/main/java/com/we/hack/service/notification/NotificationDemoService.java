package com.we.hack.service.notification;

import com.we.hack.model.Hackathon;
import com.we.hack.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

/**
 * Demo Service showcasing Decorator + Observer pattern integration
 * Demonstrates various notification scenarios in the WeHack application
 */
@Service
public class NotificationDemoService {

    @Autowired
    private UnifiedNotificationService unifiedNotificationService;

    /**
     * Demo Scenario 1: Single notification with decorator enhancement
     * Shows how decorator pattern adds Slack to email notifications
     */
    public void demoSingleNotificationWithDecorator(Hackathon hackathon, User organizer, String recipientEmail) {
        System.out.println("\n🎯 DEMO 1: Single Notification with Decorator Pattern");
        System.out.println("📧 Sending to: " + recipientEmail);
        System.out.println("🔔 Slack enabled: " + hackathon.isSlackEnabled());
        
        String subject = "Welcome to " + hackathon.getTitle();
        String content = "You have successfully registered for this amazing hackathon!";
        
        // This will use Email + Slack (if enabled) through decorator pattern
        unifiedNotificationService.sendNotification(hackathon, organizer, recipientEmail, subject, content);
        
        System.out.println("✅ Demo 1 Complete\n");
    }

    /**
     * Demo Scenario 2: Observer pattern broadcasting
     * Shows how multiple observers receive notifications simultaneously
     */
    public void demoObserverBroadcasting(Hackathon hackathon, User organizer, List<String> judgeEmails) {
        System.out.println("\n🎯 DEMO 2: Observer Pattern Broadcasting");
        
        // First, register judges as observers
        int hackathonId = Math.toIntExact(hackathon.getId());
        for (String judgeEmail : judgeEmails) {
            unifiedNotificationService.registerObserver(hackathonId, judgeEmail, organizer);
            System.out.println("👥 Registered observer: " + judgeEmail);
        }
        
        System.out.println("📢 Observer count: " + unifiedNotificationService.getObserverCount(hackathonId));
        
        // Now broadcast to all observers
        String subject = "Hackathon Update";
        String content = "All judges have been registered. Stay tuned for more updates!";
        
        unifiedNotificationService.broadcastNotification(hackathonId, hackathon, subject, content);
        
        System.out.println("✅ Demo 2 Complete\n");
    }

    /**
     * Demo Scenario 3: Combined Decorator + Observer workflow
     * Shows the full power of integrated patterns
     */
    public void demoIntegratedWorkflow(Hackathon hackathon, User organizer) {
        System.out.println("\n🎯 DEMO 3: Integrated Decorator + Observer Workflow");
        
        int hackathonId = Math.toIntExact(hackathon.getId());
        
        // Step 1: Register multiple judges as observers
        List<String> judges = Arrays.asList(
            "judge1@example.com", 
            "judge2@example.com", 
            "judge3@example.com"
        );
        
        for (String judge : judges) {
            unifiedNotificationService.registerObserver(hackathonId, judge, organizer);
        }
        
        System.out.println("👥 Registered " + judges.size() + " judges as observers");
        
        // Step 2: Send individual welcome messages (Decorator pattern)
        for (String judge : judges) {
            String personalizedContent = "Welcome " + judge + "! You are now a judge for " + hackathon.getTitle();
            unifiedNotificationService.sendNotification(hackathon, organizer, judge, 
                "Judge Welcome", personalizedContent);
        }
        
        // Step 3: Broadcast general update (Observer pattern with Decorator enhancement)
        String broadcastContent = """
            🎉 All judges are now registered!
            
            Hackathon: %s
            Judges: %d
            
            Next steps:
            - Wait for hackathon to be published
            - You'll receive updates automatically
            - Be ready to evaluate amazing projects!
            """.formatted(hackathon.getTitle(), judges.size());
        
        unifiedNotificationService.broadcastNotification(hackathonId, hackathon, 
            "Judge Registration Complete", broadcastContent);
        
        System.out.println("✅ Demo 3 Complete - Showcased full integration!\n");
    }

    /**
     * Demo Scenario 4: Lifecycle notifications
     * Shows how hackathon state changes trigger observer notifications with decorator enhancements
     */
    public void demoHackathonLifecycleNotifications(Hackathon hackathon, User organizer) {
        System.out.println("\n🎯 DEMO 4: Hackathon Lifecycle Notifications");
        
        int hackathonId = Math.toIntExact(hackathon.getId());
        
        // Register some observers
        List<String> participants = Arrays.asList("participant1@example.com", "participant2@example.com");
        List<String> judges = Arrays.asList("judge1@example.com", "judge2@example.com");
        
        // Register all as observers
        for (String email : participants) {
            unifiedNotificationService.registerObserver(hackathonId, email, organizer);
        }
        for (String email : judges) {
            unifiedNotificationService.registerObserver(hackathonId, email, organizer);
        }
        
        System.out.println("👥 Total observers registered: " + unifiedNotificationService.getObserverCount(hackathonId));
        
        // Simulate lifecycle events
        System.out.println("\n📢 Simulating hackathon lifecycle events:");
        
        // Published
        unifiedNotificationService.broadcastNotification(hackathonId, hackathon, 
            "Hackathon Published", "🎉 " + hackathon.getTitle() + " is now live! Start building!");
        
        // Judging started  
        unifiedNotificationService.broadcastNotification(hackathonId, hackathon,
            "Judging Started", "⚖️ Judging phase has begun for " + hackathon.getTitle());
        
        // Completed
        unifiedNotificationService.broadcastNotification(hackathonId, hackathon,
            "Hackathon Completed", "🏆 " + hackathon.getTitle() + " is complete! Check the leaderboard!");
        
        System.out.println("✅ Demo 4 Complete - Lifecycle notifications sent!\n");
    }

    /**
     * Demo summary showing the benefits of integrated patterns
     */
    public void showIntegrationBenefits() {
        System.out.println("\n🏆 DECORATOR + OBSERVER PATTERN INTEGRATION BENEFITS:");
        System.out.println("═══════════════════════════════════════════════════════");
        System.out.println("✅ Decorator Pattern Benefits:");
        System.out.println("   • Multi-channel notifications (Email + Slack)");
        System.out.println("   • Easy to add new notification channels");
        System.out.println("   • Maintains single responsibility principle");
        System.out.println("   • Runtime behavior modification");
        
        System.out.println("\n✅ Observer Pattern Benefits:");
        System.out.println("   • Broadcast to multiple recipients");
        System.out.println("   • Loose coupling between subject and observers");
        System.out.println("   • Dynamic subscription/unsubscription");
        System.out.println("   • Event-driven notifications");
        
        System.out.println("\n🚀 COMBINED BENEFITS:");
        System.out.println("   • Each observer notification uses decorator enhancements");
        System.out.println("   • Broadcast notifications through multiple channels");
        System.out.println("   • Unified API for all notification scenarios");
        System.out.println("   • Consistent behavior across different notification types");
        System.out.println("   • Easy maintenance and extensibility");
        System.out.println("═══════════════════════════════════════════════════════\n");
    }
} 