package com.we.hack.repository;

import com.we.hack.model.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

// Spring transaction management
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    @Modifying
    @Transactional
    @Query("DELETE FROM Submission s WHERE s.user.id = :userId AND s.hackathon.id = :hackathonId")
    void deleteByUserAndHackathon(@Param("userId") Long userId,
                                  @Param("hackathonId") Long hackathonId);

    List<Submission> findByHackathonIdAndUserId(Long hackathonId, Long userId);

    List<Submission> findByHackathonId(int HackathonId);
}
