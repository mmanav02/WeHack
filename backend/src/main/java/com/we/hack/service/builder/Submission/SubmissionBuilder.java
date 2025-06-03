package com.we.hack.service.builder.Submission;

import com.we.hack.model.Submission;
import com.we.hack.model.Team;

public interface SubmissionBuilder {

    SubmissionBuilder team(Team team);                     // required
    SubmissionBuilder title(String title);                 // required
    SubmissionBuilder description(String markdown);        // optional
    SubmissionBuilder projectUrl(String url);// optional

    Submission build();
}
