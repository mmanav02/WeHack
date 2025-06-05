package com.we.hack.service.template;

import com.we.hack.model.Submission;

import java.util.Collections;
import java.util.List;

public abstract class ScoreboardTemplate {

    public final List<Submission> generate(Long hackathonId) {
        if (!shouldShowLeaderboard(hackathonId)) {
            return Collections.emptyList(); // No leaderboard in this phase
        }

        List<Submission> submissions = getSubmissions(hackathonId);
        return getSortedSubmissions(submissions);
    }

    protected abstract boolean shouldShowLeaderboard(Long hackathonId);

    protected abstract List<Submission> getSubmissions(Long hackathonId);

    protected abstract List<Submission> getSortedSubmissions(List<Submission> submissions);
}
