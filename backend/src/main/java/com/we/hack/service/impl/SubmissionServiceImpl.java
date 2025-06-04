package com.we.hack.service.impl;

import com.we.hack.dto.SubmissionDto;
import com.we.hack.mapper.SubmissionMapper;
import com.we.hack.model.Hackathon;
import com.we.hack.model.Submission;
import com.we.hack.model.Team;
import com.we.hack.model.User;
import com.we.hack.repository.HackathonRepository;
import com.we.hack.repository.SubmissionRepository;
import com.we.hack.repository.TeamRepository;
import com.we.hack.repository.UserRepository;
import com.we.hack.service.SubmissionService;
import com.we.hack.service.builder.Submission.SubmissionBuilder;
import com.we.hack.service.iterator.CollectionFactory;
import com.we.hack.service.iterator.Iterator;
import com.we.hack.service.memento.SubmissionHistoryManager;
import com.we.hack.service.memento.SubmissionMemento;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
public class SubmissionServiceImpl implements SubmissionService {

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private HackathonRepository hackathonRepository;

    @Autowired
    private SubmissionHistoryManager submissionHistoryManager;

    @Autowired
    private CollectionFactory collectionFactory;

    // This is only for builder pattern so not in the SubmissionService Interface and so now Overridden
    @Transactional
    public Submission createFinalSubmission(SubmissionBuilder builder,
                                            Long userId,
                                            int  hackathonId,
                                            MultipartFile file) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Hackathon hackathon = hackathonRepository.findById(hackathonId)
                .orElseThrow(() -> new RuntimeException("Hackathon not found"));

        Team team = teamRepository.findFirstByUsers_Id(userId)
                .orElseThrow(() -> new RuntimeException("User not in any team"));

        Submission submission = builder
                .team(team)
                .setSubmitTime()
                .setUser(user)
                .setHackathon(hackathon)
                .build();

        if (file != null && !file.isEmpty()) {
            try {
                String uploadDir = System.getProperty("user.dir") + "/uploads/";
                File dir = new File(uploadDir);
                if (!dir.exists()) dir.mkdirs();

                String path = uploadDir + System.currentTimeMillis() + "_" + file.getOriginalFilename();
                file.transferTo(new File(path));
                submission.setFilePath("uploads/" + new File(path).getName());
            } catch (IOException e) {
                throw new RuntimeException("File upload failed", e);
            }
        }

        validateSubmission(userId, hackathonId, submission, file);
        submission = submissionRepository.save(submission);
        team.setSubmission(submission);
        teamRepository.save(team);

        submissionHistoryManager.push(team.getId(), submission.createMemento());
        return submission;
    }

    @Override
    public List<SubmissionDto> listSubmissions(Hackathon hackathon, Team team){
        Iterator<Submission> it = collectionFactory.submissions(team, hackathon).createIterator();
        List<SubmissionDto> result = new ArrayList<>();
        while (it.hasNext()) {
            result.add(SubmissionMapper.toDto(it.next()));
        }
        return result;
    }

    @Override
    public Submission saveSubmission(Long userId, int hackathonId, Submission submission) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Hackathon hackathon = hackathonRepository.findById(hackathonId)
                .orElseThrow(() -> new RuntimeException("Hackathon not found"));

        Team team = teamRepository.findFirstByUsers_Id(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException("User is not in any team"));

        submission.setUser(user);
        submission.setHackathon(hackathon);
        submission.setTeam(team);

        team.setSubmission(submission);
        teamRepository.save(team);

        return submissionRepository.save(submission);
    }

    @Override
    public Submission validateSubmission(Long userId, int hackathonId, Submission submission, MultipartFile file) {
        // Not responsible for validation, so just return back
        // validation implemented by proxy
        return submission;
    }

    @Override
    public Submission editSubmission(int hackathonId, Long userId, Long submissionId, String title, String description, String projectUrl, MultipartFile file) {
        Submission oldSubmission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        // Optional: Validate that submission belongs to user and hackathon
        if (!(oldSubmission.getHackathon().getId() == hackathonId)) {
            throw new RuntimeException("Submission does not belong to this hackathon");
        }

        Team team = oldSubmission.getTeam();

        // Check membership in the team
        Long teamId = team.getId();
        if (!teamRepository.existsByIdAndUsers_Id(teamId, userId)) {
            throw new RuntimeException("User is not a member of this team");
        }

        Submission submissionNew = new Submission();
        submissionNew.setTitle(title);
        submissionNew.setDescription(description);
        submissionNew.setProjectUrl(projectUrl);
        submissionNew.setSubmitTime(Instant.now());
        submissionNew.setHackathon(oldSubmission.getHackathon());
        submissionNew.setUser(oldSubmission.getUser());
        submissionNew.setTeam(oldSubmission.getTeam());

        if (file != null && !file.isEmpty()) {
            try {
                String uploadDir = System.getProperty("user.dir") + "/uploads/";
                File directory = new File(uploadDir);
                if (!directory.exists()) directory.mkdirs();

                String filePath = uploadDir + System.currentTimeMillis() + "_" + file.getOriginalFilename();
                file.transferTo(new File(filePath));
                submissionNew.setFilePath(filePath);
            } catch (IOException e) {
                throw new RuntimeException("Failed to upload file", e);
            }
        }

        submissionNew = submissionRepository.save(submissionNew);
        team.setSubmission(submissionNew);
        teamRepository.save(team);

        validateSubmission(userId, hackathonId, submissionNew, file);

        submissionHistoryManager.push(submissionNew.getTeam().getId(), submissionNew.createMemento());
       return submissionNew;
    }

    @Transactional
    public Submission undoLastEdit(Long teamId, Long submissionId, Long hackathonId) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        Team team = submission.getTeam();
        if (!team.getId().equals(teamId))
            throw new RuntimeException("Submission does not belong to this team");

        if (!submission.getHackathon().getId().equals(hackathonId))
            throw new RuntimeException("Submission does not belong to this hackathon");

        SubmissionMemento memento = submissionHistoryManager.pop(teamId)
                .orElseThrow(() -> new RuntimeException("No history to undo"));

        submission.restore(memento);
        Submission saved = submissionRepository.save(submission);

        team.setSubmission(saved);
        teamRepository.save(team);

        return saved;
    }

}
