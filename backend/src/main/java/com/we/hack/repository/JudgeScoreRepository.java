package com.we.hack.repository;

import com.we.hack.model.JudgeScore;
import com.we.hack.model.Submission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JudgeScoreRepository extends JpaRepository<JudgeScore, Long> {
    List<JudgeScore> findBySubmission(Submission submission);
}
