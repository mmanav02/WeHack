package com.we.hack.service.strategy;

import java.util.List;

public class SimpleAverageStrategy implements ScoringStrategy {


    @Override
    public double calculateScore(List<Integer> scores) {
        if (scores.size() != 3) throw new IllegalArgumentException("Three scores required");

        return scores.stream().mapToInt(Integer::intValue).average().orElse(0.0);
    }
}
