package com.we.hack.service.impl;

import com.we.hack.model.Hackathon;
import com.we.hack.model.HackathonRole;
import com.we.hack.model.Role;
import com.we.hack.model.User;
import com.we.hack.repository.HackathonRepository;
import com.we.hack.repository.HackathonRoleRepository;
import com.we.hack.repository.UserRepository;
import com.we.hack.service.HackathonRoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class HackathonRoleServiceImpl implements HackathonRoleService {

    @Autowired
    private HackathonRoleRepository hackathonRoleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HackathonRepository hackathonRepository;

    @Override
    public HackathonRole joinHackathon(Long userId, int hackathonId, Role role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Hackathon hackathon = hackathonRepository.findById(hackathonId)
                .orElseThrow(() -> new RuntimeException("Hackathon not found"));

        HackathonRole hackathonRole = new HackathonRole();
        hackathonRole.setUser(user);
        hackathonRole.setHackathon(hackathon);
        hackathonRole.setRole(role);

        return hackathonRoleRepository.save(hackathonRole);
    }
}
