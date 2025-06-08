package com.we.hack.service.adapter;

import com.we.hack.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(name = "notifications.email.provider", havingValue = "spring")
public class SpringMailServiceAdapter implements MailServiceAdapter {

    @Autowired
    private JavaMailSender javaMailSender;

    @Override
    public void sendMail(User organizer, String recipient, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(organizer.getEmail());
            message.setTo(recipient);
            message.setSubject(subject);
            message.setText(body);
            
            javaMailSender.send(message);
            System.out.printf("[SpringMailServiceAdapter] Email sent to %s%n", recipient);
            
        } catch (Exception e) {
            System.err.printf("[SpringMailServiceAdapter] Failed to send email to %s: %s%n", 
                               recipient, e.getMessage());
            // Don't throw exception - graceful degradation
        }
    }
} 