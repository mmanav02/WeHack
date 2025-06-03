package com.we.hack.service.impl;

import com.we.hack.model.Comment;
import com.we.hack.model.Hackathon;
import com.we.hack.model.User;
import com.we.hack.repository.CommentRepository;
import com.we.hack.repository.HackathonRepository;
import com.we.hack.repository.UserRepository;
import com.we.hack.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommentServiceImpl implements CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private HackathonRepository hackathonRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public Comment addComment(int hackathonId, Long userId, String content, Integer parentId) {
        Comment comment = new Comment();
        comment.setContent(content);
        comment.setHackathon(hackathonRepository.findById(hackathonId)
                .orElseThrow(() -> new RuntimeException("Hackathon not found")));
        comment.setUser(userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found")));

        if (parentId != null) {
            Comment parent = commentRepository.findById(parentId)
                    .orElseThrow(() -> new RuntimeException("Parent comment not found"));
            comment.setParent(parent);
        }

        return commentRepository.save(comment);
    }

    @Override
    public List<Comment> getTopLevelComments(int hackathonId) {
        return commentRepository.findByHackathonIdAndParentIsNull(hackathonId);
    }
}
