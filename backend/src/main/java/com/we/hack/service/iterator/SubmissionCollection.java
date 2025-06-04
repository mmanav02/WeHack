package com.we.hack.service.iterator;

import com.we.hack.model.Submission;


import java.util.List;

public class SubmissionCollection implements Aggregate<Submission>, Iterable<Submission> {
    private final List<Submission> submissions;
    public SubmissionCollection(List<Submission> submissions) { this.submissions = submissions; }

    @Override
    public Iterator<Submission> createIterator() {
        return new ListIterator<>(submissions);
    }

    @Override
    public java.util.Iterator<Submission> iterator() {
        return submissions.iterator();
    }
}
