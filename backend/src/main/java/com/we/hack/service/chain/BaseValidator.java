package com.we.hack.service.chain;

import com.we.hack.model.Submission;
import org.springframework.web.multipart.MultipartFile;

public abstract class  BaseValidator implements SubmissionValidator {
    private SubmissionValidator next;

    @Override
    public void setNext(SubmissionValidator next) {
        this.next = next;
    }

    @Override
    public void validate(Submission submission, MultipartFile file) {
        doValidate(submission, file);
        if(next != null){
            next.validate(submission, file);
        }
    }

    protected abstract void doValidate(Submission submission, MultipartFile file);
}
