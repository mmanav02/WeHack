package com.we.hack.service.proxy;

import com.we.hack.dto.SubmissionDto;
import com.we.hack.model.Hackathon;
import com.we.hack.model.Submission;
import com.we.hack.model.Team;
import com.we.hack.service.SubmissionService;
import com.we.hack.service.chain.DescriptionValidator;
import com.we.hack.service.chain.FileSizeValidator;
import com.we.hack.service.chain.SubmissionValidator;
import com.we.hack.service.chain.TitleValidator;
import com.we.hack.service.impl.SubmissionServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Primary;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@Primary
public class SubmissionServiceProxy implements SubmissionService {

    @Autowired
    private SubmissionServiceImpl realSubmissionService;

    // Track last submission timestamp: "userId-hackathonId" → timestamp
    private final Map<String, Long> lastSubmissionTime = new HashMap<>();

    @Override
    public Submission validateSubmission(Long userId, int hackathonId, Submission submission, MultipartFile file) {
        String key = userId + "-" + hackathonId;
        long now = System.currentTimeMillis();

        if (lastSubmissionTime.containsKey(key)) {
            long lastTime = lastSubmissionTime.get(key);
            if (now - lastTime < 60_000) {
                throw new ResponseStatusException(
                        HttpStatus.TOO_MANY_REQUESTS,
                        "⏱️ Please wait 60 seconds before submitting again."
                );
            }
        }

        SubmissionValidator titleValidator = new TitleValidator();
        SubmissionValidator descValidator = new DescriptionValidator();
        SubmissionValidator fileValidator = new FileSizeValidator();

        titleValidator.setNext(descValidator);
        descValidator.setNext(fileValidator);

        titleValidator.validate(submission, file);

        lastSubmissionTime.put(key, now);
        return submission;
    }

    @Override
    public List<SubmissionDto> listSubmissions(Hackathon hackathon, Team team) {
        // This shouldn't be called
        return null;
    }


    @Override
    public Submission saveSubmission(Long userId, int hackathonId, Submission submission) {
        return realSubmissionService.saveSubmission(userId, hackathonId, submission);
    }

    @Override
    public Submission editSubmission(int hackathonId, Long userId, Long submissionId, String title, String description, String projectUrl, MultipartFile file) {
        //  Apply validators again to validate title/description/file during edit
        Submission submission = new Submission();
        submission.setTitle(title);
        submission.setDescription(description);
        submission.setProjectUrl(projectUrl);

        SubmissionValidator titleValidator = new TitleValidator();
        SubmissionValidator descValidator = new DescriptionValidator();
        SubmissionValidator fileValidator = new FileSizeValidator();

        titleValidator.setNext(descValidator);
        descValidator.setNext(fileValidator);

        titleValidator.validate(submission, file);

        return realSubmissionService.editSubmission(hackathonId, userId, submissionId, title, description, projectUrl, file);
    }


}
