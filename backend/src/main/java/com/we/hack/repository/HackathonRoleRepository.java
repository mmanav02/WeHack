package com.we.hack.repository;

import com.we.hack.model.ApprovalStatus;
import com.we.hack.model.HackathonRole;
import com.we.hack.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HackathonRoleRepository extends JpaRepository<HackathonRole, Long> {
    List<HackathonRole> findByHackathonIdAndRoleAndStatus(int hackathonId, Role role, ApprovalStatus status);
    Optional<HackathonRole> findByUserIdAndHackathonId(Long user_id, Long hackathon_id);
    List<HackathonRole> findByHackathonIdAndRole(int hackathonId, Role role);
    void deleteByHackathonId(int hackathonId);
}
