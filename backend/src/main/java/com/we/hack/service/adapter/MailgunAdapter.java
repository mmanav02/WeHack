package com.we.hack.service.adapter;

import com.we.hack.model.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Component
public class MailgunAdapter implements MailServiceAdapter {

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
    }

    @Override
    public void sendMail(User organiser,
                         String recipient,
                         String subject,
                         String body) {

        try {
            String auth = Base64.getEncoder()
                    .encodeToString(("api:" + apiKey)
                            .getBytes(StandardCharsets.UTF_8));

            String form =
                    field("from", organiser.getUsername() + " <no-reply@" + domain + ">")
                            + field("to", recipient)
                            + field("subject", subject)
                            + field("text", body)
                            + field("h:Reply-To", organiser.getEmail());

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(baseUrl + domain + "/messages"))
                    .header("Authorization", "Basic " + auth)
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .POST(HttpRequest.BodyPublishers.ofString(form))
                    .build();

            System.out.println("REQ URI  : " + request.uri());     // <-- added
            System.out.println("REQ BODY : " + form);              // <-- added


            http.sendAsync(request, HttpResponse.BodyHandlers.discarding())
                    .thenAccept(resp -> {
                        if (resp.statusCode() >= 300) {
                            System.err.println("Mailgun error " + resp.statusCode());
                        }
                    });

        } catch (Exception ex) {
            ex.printStackTrace();   // replace with proper logging
        }
    }

    /** URL-encodes a single field (name=value&) */
    private static String field(String name, String value) {
        return name + '=' +
                URLEncoder.encode(value, StandardCharsets.UTF_8) + '&';
    }
}