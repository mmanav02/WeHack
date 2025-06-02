package com.we.hack.repository;
import com.we.hack.model.Hackathon;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HackathonRepository extends JpaRepository<Hackathon, Integer> {
}
