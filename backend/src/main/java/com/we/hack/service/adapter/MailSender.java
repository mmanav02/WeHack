package com.we.hack.service.adapter;

import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;

public class MailSender {
    public static JavaMailSenderImpl createSender(String email, String password) {

        JavaMailSenderImpl sender = new JavaMailSenderImpl();
        sender.setHost("smtp.gmail.com");
        sender.setPort(587);
        sender.setUsername(email);
        sender.setPassword(password);

        Properties props = sender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.debug", "false");

        return sender;
    }
}
