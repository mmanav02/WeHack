package com.we.hack.service.factory;

import com.we.hack.model.*;
import org.springframework.stereotype.Service;

@Service
public class HackathonRoleFactory {

    public HackathonRole create(User user, Hackathon hackathon, Role role) {
        HackathonRole hackathonRole = new HackathonRole();
        hackathonRole.setUser(user);
        hackathonRole.setHackathon(hackathon);
        hackathonRole.setRole(role);

        // Centralized approval logic
        if (role == Role.PARTICIPANT) {
            hackathonRole.setStatus(ApprovalStatus.APPROVED);
        } else if (role == Role.JUDGE) {
            hackathonRole.setStatus(ApprovalStatus.PENDING);
        } else {
            hackathonRole.setStatus(ApprovalStatus.APPROVED);
        }

        return hackathonRole;
    }
}
