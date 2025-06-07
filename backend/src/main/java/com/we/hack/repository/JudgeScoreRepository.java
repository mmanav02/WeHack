package com.we.hack.repository;

import com.we.hack.model.JudgeScore;
import com.we.hack.model.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface JudgeScoreRepository extends JpaRepository<JudgeScore, Long> {
    List<JudgeScore> findBySubmission(Submission submission);
    
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM judge_score WHERE submission_id IN (SELECT id FROM submission WHERE hackathon_id = :hackathonId)", nativeQuery = true)
    void deleteByHackathonId(@Param("hackathonId") int hackathonId);
}
