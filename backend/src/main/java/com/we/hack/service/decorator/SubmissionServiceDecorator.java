package com.we.hack.service.decorator;

import com.we.hack.model.Submission;
import com.we.hack.service.SubmissionService;
import org.springframework.web.multipart.MultipartFile;

public abstract class SubmissionServiceDecorator implements SubmissionService {
    protected SubmissionService delegate;

    public SubmissionServiceDecorator(SubmissionService delegate) {
        this.delegate = delegate;
    }

    @Override
    public Submission validateSubmission(Long userId, int hackathonId, Submission submission, MultipartFile file) {
        return delegate.validateSubmission(userId, hackathonId, submission, file);
    }

    @Override
    public Submission saveSubmission(Long userId, int hackathonId, Submission submission) {
        return delegate.saveSubmission(userId, hackathonId, submission);
    }

    @Override
    public Submission editSubmission(int hackathonId, Long userId, Long submissionId, String title, String description, String projectUrl, MultipartFile file) {
        return delegate.editSubmission(hackathonId, userId, submissionId, title, description, projectUrl, file);
    }
}
