package com.we.hack.service.adapter;

import com.we.hack.model.User;
import com.we.hack.service.logger.Logger;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Component
@ConditionalOnProperty(name = "notifications.email.provider", havingValue = "mailgun")
public class MailgunAdapter implements MailServiceAdapter {

    private static Logger logger;
    
    static {
        try {
            logger = Logger.getInstance(100);
        } catch (IOException e) {
            System.err.println("Failed to initialize logger: " + e.getMessage());
        }
    }

    /** Mailgun domain: e.g. mg.example.com */
    private final String domain;

    /** Mailgun private API key: key-xxxxxxxxxxxxxxxx */
    private final String apiKey;

    /** API base url (override only if you use EU endpoint) */
    private final String baseUrl;

    private final HttpClient http = HttpClient.newHttpClient();

    public MailgunAdapter(
            @Value("${mailgun.domain}")  String domain,
            @Value("${mailgun.apiKey}")  String apiKey,
            @Value("${mailgun.baseUrl}") String baseUrl) {

        this.domain  = domain;
        this.apiKey  = apiKey;
        this.baseUrl = baseUrl.endsWith("/") ? baseUrl : baseUrl + "/";
        
        logger.INFO("MailgunAdapter initialized - domain: " + domain + ", baseUrl: " + this.baseUrl);
        logger.DEBUG("API key configured: " + (apiKey != null && !apiKey.isEmpty() ? "Yes" : "No"));
    }

    @Override
    public void sendMail(User organiser,
                         String recipient,
                         String subject,
                         String body) {
        logger.INFO("MailgunAdapter.sendMail() - Sending email via Mailgun");
        logger.DEBUG("Email details: organizer=" + organiser.getEmail() + ", recipient=" + recipient + 
                    ", subject=" + subject + ", bodyLength=" + (body != null ? body.length() : 0));

        try {
            // Validate inputs
            if (recipient == null || recipient.trim().isEmpty()) {
                logger.ERROR("Invalid recipient - recipient is null or empty");
                throw new RuntimeException("Recipient email cannot be empty");
            }
            
            if (subject == null || subject.trim().isEmpty()) {
                logger.WARN("Email subject is empty");
            }
            
            if (body == null) {
                body = "";
                logger.WARN("Email body is null - using empty string");
            }

            // Encode API credentials
            String auth = Base64.getEncoder()
                    .encodeToString(("api:" + apiKey)
                            .getBytes(StandardCharsets.UTF_8));
            logger.DEBUG("API credentials encoded for authentication");

            // Build form data
            String form =
                    field("from", organiser.getUsername() + " <no-reply@" + domain + ">")
                            + field("to", recipient)
                            + field("subject", subject)
                            + field("text", body)
                            + field("h:Reply-To", organiser.getEmail());

            logger.DEBUG("Form data prepared for Mailgun API");

            // Build HTTP request
            String requestUrl = baseUrl + domain + "/messages";
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(requestUrl))
                    .header("Authorization", "Basic " + auth)
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .POST(HttpRequest.BodyPublishers.ofString(form))
                    .build();

            logger.DEBUG("HTTP request built - URL: " + requestUrl);
            logger.DEBUG("Request body: " + form);

            // Send request asynchronously
            logger.DEBUG("Sending HTTP request to Mailgun API");
            http.sendAsync(request, HttpResponse.BodyHandlers.discarding())
                    .thenAccept(resp -> {
                        if (resp.statusCode() >= 300) {
                            logger.ERROR("Mailgun API error - status code: " + resp.statusCode());
                            logger.ERROR("Failed to send email to: " + recipient + " via Mailgun");
                        } else {
                            logger.INFO("Email sent successfully via Mailgun - recipient: " + recipient + 
                                       ", status: " + resp.statusCode());
                        }
                    })
                    .exceptionally(throwable -> {
                        logger.ERROR("Mailgun API request failed: " + throwable.getMessage());
                        logger.SEVERE("Exception during Mailgun API call: " + throwable.toString());
                        return null;
                    });

            logger.DEBUG("Mailgun API request initiated asynchronously");

        } catch (Exception ex) {
            logger.ERROR("Failed to send email via Mailgun - recipient: " + recipient + 
                        ", organizer: " + organiser.getEmail() + ", error: " + ex.getMessage());
            logger.SEVERE("Stack trace: " + ex.toString());
            ex.printStackTrace();   // Keep existing behavior
        }
    }

    /** URL-encodes a single field (name=value&) */
    private static String field(String name, String value) {
        return name + '=' +
                URLEncoder.encode(value, StandardCharsets.UTF_8) + '&';
    }
}