package com.we.hack.service.builder.Submission;

import com.we.hack.model.Hackathon;
import com.we.hack.model.Submission;
import com.we.hack.model.Team;
import com.we.hack.model.User;

import java.time.Instant;
import java.util.Objects;

public class ConcreteSubmissionBuilder implements SubmissionBuilder {
    private final Submission submission = new Submission();
    private boolean isDraft = false;
    private boolean isTeamSubmission = true; // Default to team submission

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
    public SubmissionBuilder asDraft(boolean isDraft) {
        this.isDraft = isDraft;
        return this;
    }

    @Override
    public SubmissionBuilder asTeamSubmission(boolean isTeamSubmission) {
        this.isTeamSubmission = isTeamSubmission;
        return this;
    }

    @Override
    public SubmissionBuilder withFilePath(String filePath) {
        submission.setFilePath(filePath);
        return this;
    }

    @Override
    public SubmissionBuilder withId(Long id) {
        submission.setId(id);
        return this;
    }

    @Override
    public Submission build() {
        if (isDraft) {
            return buildDraft();
        }
        
        // Strict validation for final submissions
        Objects.requireNonNull(submission.getTeam(), "Team is mandatory for final submission");
        Objects.requireNonNull(submission.getTitle(), "Title is mandatory for final submission");
        Objects.requireNonNull(submission.getDescription(), "Description is mandatory for final submission");
        
        if (submission.getTitle().trim().length() < 3) {
            throw new IllegalArgumentException("Title must be at least 3 characters");
        }
        
        if (submission.getDescription().trim().length() < 10) {
            throw new IllegalArgumentException("Description must be at least 10 characters");
        }
        
        return submission;
    }

    @Override
    public Submission buildDraft() {
        // Relaxed validation for draft submissions
        if (submission.getTitle() != null && submission.getTitle().trim().isEmpty()) {
            submission.setTitle(null); // Clear empty titles
        }
        
        if (submission.getDescription() != null && submission.getDescription().trim().isEmpty()) {
            submission.setDescription(null); // Clear empty descriptions
        }
        
        return submission;
    }
}
