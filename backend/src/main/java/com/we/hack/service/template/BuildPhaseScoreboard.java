package com.we.hack.service.template;

import com.we.hack.model.Submission;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
public class BuildPhaseScoreboard extends ScoreboardTemplate {

    @Override
    protected boolean shouldShowLeaderboard(Long hackathonId) {
        return false;  // leaderboard hidden
    }

    @Override
    protected List<Submission> getSubmissions(Long hackathonId) {
        return Collections.emptyList();
    }

    @Override
    protected List<Submission> getSortedSubmissions(List<Submission> submissions) {
        return submissions;  // no-op
    }
}
