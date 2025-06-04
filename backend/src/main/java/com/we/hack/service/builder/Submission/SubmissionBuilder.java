package com.we.hack.service.builder.Submission;

import com.we.hack.model.Hackathon;
import com.we.hack.model.Submission;
import com.we.hack.model.Team;
import com.we.hack.model.User;

public interface SubmissionBuilder {

    SubmissionBuilder team(Team team);                     // required
    SubmissionBuilder title(String title);                 // required
    SubmissionBuilder description(String markdown);        // optional
    SubmissionBuilder projectUrl(String url);// optional
    SubmissionBuilder setSubmitTime();
    SubmissionBuilder setUser(User user);
    SubmissionBuilder setHackathon(Hackathon hackathon);
    Submission build();
}
