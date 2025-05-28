package com.we.hack.repository;

import com.we.hack.model.ApprovalStatus;
import com.we.hack.model.HackathonRole;
import com.we.hack.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HackathonRoleRepository extends JpaRepository<HackathonRole, Long> {
    List<HackathonRole> findByHackathonIdAndRoleAndStatus(int hackathonId, Role role, ApprovalStatus status);

}
