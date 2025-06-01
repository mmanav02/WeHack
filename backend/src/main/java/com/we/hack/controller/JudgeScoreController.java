package com.we.hack.controller;

import com.we.hack.dto.JudgeScoreRequest;
import com.we.hack.service.impl.JudgeScoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/judge")
public class JudgeScoreController {

    @Autowired
    private JudgeScoreService judgeScoreService;

    @PostMapping("/score")
    public String submitScore(@RequestBody JudgeScoreRequest request) {
        judgeScoreService.submitScore(request);
        return "Score submitted successfully.";
    }

    @GetMapping("/score/final/{submissionId}")
    public double getFinalScore(@PathVariable Long submissionId) {
        return judgeScoreService.calculateFinalScore(submissionId);
    }
}
