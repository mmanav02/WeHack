package com.we.hack.service.builder.Submission;

import com.we.hack.model.Hackathon;
import com.we.hack.model.Submission;
import com.we.hack.model.Team;
import com.we.hack.model.User;

import java.time.Instant;
import java.util.Objects;

public class ConcreteSubmissionBuilder implements SubmissionBuilder {
    private final Submission submission = new Submission();

    @Override
    public SubmissionBuilder team(Team t) {
        submission.setTeam(t);
        return this;
    }

    @Override
    public SubmissionBuilder title(String t) {
        submission.setTitle(t);
        return this;
    }

    @Override
    public SubmissionBuilder description(String md) {
        submission.setDescription(md);
        return this;
    }

    @Override
    public SubmissionBuilder setUser(User user){
        submission.setUser(user);
        return this;
    }

    @Override
    public SubmissionBuilder setHackathon(Hackathon hackathon){
        submission.setHackathon(hackathon);
        return this;
    }

    @Override
    public SubmissionBuilder projectUrl(String url){
        submission.setProjectUrl(url);
        return this;
    }

    @Override
    public SubmissionBuilder setSubmitTime(){
        submission.setSubmitTime(Instant.now());
        return this;
    }

    @Override
    public Submission build() {
        Objects.requireNonNull(submission.getTeam(), "Team is mandatory");
        Objects.requireNonNull(submission.getTitle(), "Title is mandatory");
        return submission;
    }
}
