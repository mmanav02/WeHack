package com.we.hack.service;

import com.we.hack.model.ApprovalStatus;
import com.we.hack.model.HackathonRole;
import com.we.hack.model.Role;

import java.util.List;

public interface HackathonRoleService {
    HackathonRole joinHackathon(Long userId, int hackathonId, Role role);

    void leaveHackathon(long userId, long hackathonId);

    List<HackathonRole> getPendingJudgeRequests(int hackathonId);
    HackathonRole updateJudgeStatus(int hackathonId, Long userId, ApprovalStatus status);

}
