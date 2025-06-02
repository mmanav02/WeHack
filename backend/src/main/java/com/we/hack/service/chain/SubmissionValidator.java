package com.we.hack.service.chain;

import com.we.hack.model.Submission;
import org.springframework.web.multipart.MultipartFile;

public interface SubmissionValidator {
    void setNext(SubmissionValidator next);
    void validate(Submission submission, MultipartFile file);
}
