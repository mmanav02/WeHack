package com.we.hack.repository;
import com.we.hack.model.Hackathon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface HackathonRepository extends JpaRepository<Hackathon, Integer> {
    
    // Find all hackathons ordered by ID descending (newest first)
    @Query("SELECT h FROM Hackathon h ORDER BY h.id DESC")
    List<Hackathon> findAllOrderByIdDesc();
}
