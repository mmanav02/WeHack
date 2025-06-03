package com.we.hack.service;

import com.we.hack.model.Comment;

import java.util.List;

public interface CommentService {
    Comment addComment(int hackathonId, Long userId, String content, Integer parentId);
    List<Comment> getTopLevelComments(int hackathonId);
}
