package com.we.hack.service.decorator;

import com.we.hack.model.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

@Component
@Scope("prototype")
public class SlackNotifierDecorator extends NotifierDecorator {

    @Value("${notifications.slack.webhook}")
    private String slackWebhookUrl;

    public SlackNotifierDecorator() {
        super(null); // will be set via setWrappee()
    }

    public void setWrappee(Notifier wrappee) {
        this.wrappee = wrappee;
    }

    @Override
    public void notify(User organizer, String recipient, String subject, String content) {
        sendSlackMessage("*" + subject + "*\n" + content);
        System.out.println("SlackNotifier: sending slack message");
        super.notify(organizer, recipient, subject, content);
    }

    private void sendSlackMessage(String message) {
        try {
            if (slackWebhookUrl == null || slackWebhookUrl.isBlank() || slackWebhookUrl.contains("YOUR/SLACK/WEBHOOK")) {
                System.err.println("Slack webhook URL is not properly configured. Skipping Slack notification.");
                return;
            }

            URL url = new URL(slackWebhookUrl);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setDoOutput(true);
            conn.setRequestProperty("Content-Type", "application/json");

            String payload = "{\"text\":\"" + message.replace("\"", "\\\"").replace("\n", "\\n") + "\"}";

            try (OutputStream os = conn.getOutputStream()) {
                os.write(payload.getBytes());
                os.flush();
            }

            int responseCode = conn.getResponseCode();
            if (responseCode == 200) {
                System.out.println("Slack notification sent successfully");
            } else {
                System.err.println("Slack notification failed with code: " + responseCode);
            }
        } catch (Exception e) {
            System.err.println("Failed to send Slack notification: " + e.getMessage());
            // Don't re-throw - graceful degradation
        }
    }
}

