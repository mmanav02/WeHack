package com.we.hack.service;

import com.we.hack.model.HackathonRole;
import com.we.hack.model.Role;

import java.util.List;

public interface HackathonRoleService {
    HackathonRole joinHackathon(Long userId, int hackathonId, Role role);
    List<HackathonRole> getPendingJudgeRequests(int hackathonId);

}
