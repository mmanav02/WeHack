package com.we.hack.service.strategy;

import java.util.List;

public class WeightedAverageStrategy implements ScoringStrategy {

    @Override
    public double calculateScore(List<Integer> scores) {
        if (scores.size() != 3) throw new IllegalArgumentException("Three scores required");

        return scores.get(0) * 0.5 + scores.get(1) * 0.3 + scores.get(2) * 0.2;
    }
}
