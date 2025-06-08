package com.we.hack.service.adapter;

import com.we.hack.model.User;
import com.we.hack.service.adapter.MailSender;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "notifications.email.provider", havingValue = "organizer")
public class OrganizerMailAdapter implements MailServiceAdapter {

    @Override
    public void sendMail(User organizer, String recipient, String subject, String body) {
        if (organizer.getSmtpPassword() == null) {
            return;
        }
        JavaMailSender sender = MailSender.createSender(
                organizer.getEmail(),
                organizer.getSmtpPassword()
        );

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(organizer.getEmail());
        message.setTo(recipient);
        message.setSubject(subject);
        message.setText(body);

        sender.send(message);
    }
}
