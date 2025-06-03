package com.we.hack.repository;

import com.we.hack.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Integer> {
    List<Comment> findByHackathonIdAndParentIsNull(int hackathonId);
}
