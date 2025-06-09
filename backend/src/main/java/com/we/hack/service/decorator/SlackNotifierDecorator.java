package com.we.hack.service.decorator;

import com.we.hack.model.User;
import com.we.hack.service.logger.Logger;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

@Component
@Scope("prototype")
public class SlackNotifierDecorator extends NotifierDecorator {

    private static Logger logger;
    
    static {
        try {
            logger = Logger.getInstance(100);
        } catch (IOException e) {
            System.err.println("Failed to initialize logger: " + e.getMessage());
        }
    }

    @Value("${notifications.slack.webhook}")
    private String slackWebhookUrl;

    public SlackNotifierDecorator() {
        super(null); // will be set via setWrappee()
        logger.DEBUG("SlackNotifierDecorator created (wrappee will be set later)");
    }

    public void setWrappee(Notifier wrappee) {
        this.wrappee = wrappee;
        logger.DEBUG("SlackNotifierDecorator wrappee set to: " + (wrappee != null ? wrappee.getClass().getSimpleName() : "null"));
    }

    @Override
    public void notify(User organizer, String recipient, String subject, String content) {
        logger.INFO("SlackNotifierDecorator.notify() - Processing notification with Slack enhancement");
        logger.DEBUG("Notification details: organizer=" + organizer.getEmail() + ", recipient=" + recipient + 
                    ", subject=" + subject + ", slackEnabled=" + (slackWebhookUrl != null && !slackWebhookUrl.isBlank()));
        
        try {
            // Send Slack notification first
            String slackMessage = "*" + subject + "*\n" + content;
            sendSlackMessage(slackMessage);
            
            // Then delegate to the wrapped notifier (usually EmailNotifier)
            logger.DEBUG("Delegating to wrapped notifier: " + (wrappee != null ? wrappee.getClass().getSimpleName() : "null"));
            System.out.println("SlackNotifier: sending slack message");
            super.notify(organizer, recipient, subject, content);
            
            logger.INFO("SlackNotifierDecorator completed - both Slack and wrapped notification sent");
            
        } catch (Exception e) {
            logger.ERROR("Failed in SlackNotifierDecorator - recipient: " + recipient + 
                        ", organizer: " + organizer.getEmail() + ", error: " + e.getMessage());
            logger.SEVERE("Stack trace: " + e.toString());
            throw e;
        }
    }

    private void sendSlackMessage(String message) {
        logger.DEBUG("SlackNotifierDecorator.sendSlackMessage() - Sending message to Slack");
        logger.DEBUG("Message preview: " + (message.length() > 100 ? message.substring(0, 100) + "..." : message));
        
        try {
            if (slackWebhookUrl == null || slackWebhookUrl.isBlank() || slackWebhookUrl.contains("YOUR/SLACK/WEBHOOK")) {
                logger.WARN("Slack webhook URL is not properly configured - skipping Slack notification");
                System.err.println("Slack webhook URL is not properly configured. Skipping Slack notification.");
                return;
            }

            logger.DEBUG("Using Slack webhook URL: " + slackWebhookUrl.substring(0, Math.min(50, slackWebhookUrl.length())) + "...");

            URL url = new URL(slackWebhookUrl);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setDoOutput(true);
            conn.setRequestProperty("Content-Type", "application/json");

            String payload = "{\"text\":\"" + message.replace("\"", "\\\"").replace("\n", "\\n") + "\"}";
            logger.DEBUG("Slack payload prepared (length: " + payload.length() + ")");

            try (OutputStream os = conn.getOutputStream()) {
                os.write(payload.getBytes());
                os.flush();
            }

            int responseCode = conn.getResponseCode();
            if (responseCode == 200) {
                logger.INFO("Slack notification sent successfully - response code: " + responseCode);
                System.out.println("Slack notification sent successfully");
            } else {
                logger.ERROR("Slack notification failed - response code: " + responseCode);
                System.err.println("Slack notification failed with code: " + responseCode);
            }
            
        } catch (Exception e) {
            logger.ERROR("Failed to send Slack notification: " + e.getMessage());
            logger.SEVERE("Slack notification exception: " + e.toString());
            System.err.println("Failed to send Slack notification: " + e.getMessage());
            // Don't re-throw - graceful degradation
        }
    }
}

