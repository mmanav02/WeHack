package com.we.hack.service;

import com.we.hack.model.HackathonRole;
import com.we.hack.model.Role;

public interface HackathonRoleService {
    HackathonRole joinHackathon(Long userId, int hackathonId, Role role);
}
