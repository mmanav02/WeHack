package com.we.hack.service.Bridge;

import com.we.hack.model.JudgeScore;
import com.we.hack.service.strategy.ScoringStrategy;

import java.util.List;

public abstract class ScoreEvaluator {
    protected ScoringStrategy strategy;

    public ScoreEvaluator(ScoringStrategy strategy) {
        this.strategy = strategy;
    }

    public abstract double evaluate(List<JudgeScore> scores);
}

