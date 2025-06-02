package com.we.hack.service.chain;

import com.we.hack.model.Submission;
import org.springframework.http.HttpStatus;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

public class FileSizeValidator extends BaseValidator{

    private static final long MAX_SIZE_BYTES = 1 * 1024 * 1024;
    @Override
    protected void doValidate(Submission submission, MultipartFile file) {
        if (file != null && file.getSize() > MAX_SIZE_BYTES) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File too large (max 5MB).");
        }
    }
}
