package com.we.hack.repository;

import com.we.hack.model.Team;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TeamRepository extends JpaRepository<Team, Long> {
    Optional<Team> findFirstByUsers_Id(Long userId);

    boolean existsByIdAndUsers_Id(Long teamId, Long userId);
}
