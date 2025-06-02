package com.we.hack.service.chain;

import com.we.hack.model.Submission;
import org.springframework.http.HttpStatus;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

public class DescriptionValidator extends BaseValidator{

    @Override
    protected void doValidate(Submission submission, MultipartFile file) {
        if(submission.getDescription() == null || submission.getDescription().trim().isEmpty()){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Description is required");
        }
    }
}
