package com.we.hack.service.impl;

import com.we.hack.model.*;
import com.we.hack.repository.HackathonRepository;
import com.we.hack.repository.HackathonRoleRepository;
import com.we.hack.repository.SubmissionRepository;
import com.we.hack.repository.UserRepository;
import com.we.hack.service.HackathonRoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HackathonRoleServiceImpl implements HackathonRoleService {

    @Autowired
    private HackathonRoleRepository hackathonRoleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SubmissionRepository submissionRepository;

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

        //  Logic: auto-approve participant, pending for judge
        if (role == Role.PARTICIPANT) {
            hackathonRole.setStatus(ApprovalStatus.APPROVED);
        } else if (role == Role.JUDGE) {
            hackathonRole.setStatus(ApprovalStatus.PENDING);
        }

        return hackathonRoleRepository.save(hackathonRole);
    }

    @Override
    public void leaveHackathon(long userId, long hackathonId) {

        // 1. Make sure the link row actually exists
        HackathonRole link = hackathonRoleRepository
                .findByUserIdAndHackathonId(userId, hackathonId)
                .orElseThrow(() -> new RuntimeException("User is not enrolled in this hackathon"));

        // 2. Delete every submission this user made in that event
        submissionRepository.deleteByUserAndHackathon(userId, hackathonId);

        // 3. Delete the membership row itself
        hackathonRoleRepository.delete(link);
    }

    @Override
    public List<HackathonRole> getPendingJudgeRequests(int hackathonId) {
        return hackathonRoleRepository.findByHackathonIdAndRoleAndStatus(
                hackathonId, Role.JUDGE, ApprovalStatus.PENDING
        );
    }

    @Override
    public HackathonRole updateJudgeStatus(Long hackathonId, Long userId, ApprovalStatus status) {
        HackathonRole roleEntry = hackathonRoleRepository.findAll().stream()
                .filter(r -> r.getHackathon().getId().equals(hackathonId) &&
                        r.getUser().getId() == userId &&
                        r.getRole() == Role.JUDGE)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Judge request not found"));

        roleEntry.setStatus(status);
        return hackathonRoleRepository.save(roleEntry);
    }




}
