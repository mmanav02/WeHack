package com.we.hack.service.builder;

import com.we.hack.model.Hackathon;
import com.we.hack.model.Team;
import com.we.hack.model.User;
import com.we.hack.repository.HackathonRepository;
import com.we.hack.repository.TeamRepository;
import com.we.hack.repository.UserRepository;
import com.we.hack.service.TeamService;
import com.we.hack.service.logger.Logger;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Optional;

@Service
@Transactional          // guarantees changes are flushed
public class TeamServiceImpl implements TeamService {

    private static Logger logger;
    
    static {
        try {
            logger = Logger.getInstance(100);
        } catch (IOException e) {
            System.err.println("Failed to initialize logger: " + e.getMessage());
        }
    }

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private HackathonRepository hackathonRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional         // good practice when you modify entities
    public Team createTeam(long userId, String name, long hackathonId) {
        logger.INFO("TeamService.createTeam() - Creating team for user: " + userId + ", hackathon: " + hackathonId);
        logger.DEBUG("Team details: name=" + name + ", userId=" + userId + ", hackathonId=" + hackathonId);
        
        try {
            // Validate input
            if (name == null || name.trim().isEmpty()) {
                logger.ERROR("Invalid team name - name is null or empty");
                throw new RuntimeException("Team name cannot be empty");
            }
            
            Team team = new Team();
            team.setName(name);
            logger.DEBUG("Team entity created with name: " + name);

            // Find and validate hackathon
            Hackathon hackathon = hackathonRepository.findById((int) hackathonId)
                    .orElseThrow(() -> {
                        logger.ERROR("Hackathon not found with ID: " + hackathonId);
                        return new RuntimeException("Hackathon " + hackathonId + " not found");
                    });
            
            logger.DEBUG("Found hackathon: " + hackathon.getTitle() + " (status: " + hackathon.getStatus() + ")");

            // Find and validate user
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> {
                        logger.ERROR("User not found with ID: " + userId);
                        return new RuntimeException("User " + userId + " not found");
                    });
            
            logger.DEBUG("Found user: " + user.getEmail());

            // Check if user is already in a team for this hackathon using existing method
            Optional<Team> existingTeam = teamRepository.findFirstByUsers_Id(userId);
            if (existingTeam.isPresent() && existingTeam.get().getHackathon().getId().equals(hackathon.getId())) {
                logger.WARN("User " + userId + " is already in a team for hackathon " + hackathonId);
                throw new RuntimeException("User is already in a team for this hackathon");
            }

            // Set up team relationships
            team.setHackathon(hackathon);
            team.getUsers().add(user);
            logger.DEBUG("Team relationships configured - hackathon set and user added as initial member");

            Team savedTeam = teamRepository.save(team);
            logger.INFO("Team created successfully - teamId: " + savedTeam.getId() + 
                       ", name: " + name + ", hackathonId: " + hackathonId + 
                       ", initial member: " + user.getEmail());
            
            return savedTeam;
            
        } catch (Exception e) {
            logger.ERROR("Failed to create team - userId: " + userId + 
                        ", name: " + name + ", hackathonId: " + hackathonId + ", error: " + e.getMessage());
            logger.SEVERE("Stack trace: " + e.toString());
            throw e;
        }
    }

    @Override
    public Team addMemberToTeam(long teamId, long userId) {
        logger.INFO("TeamService.addMemberToTeam() - Adding user " + userId + " to team " + teamId);
        
        try {
            // Find and validate team
            Team team = teamRepository.findById(teamId)
                    .orElseThrow(() -> {
                        logger.ERROR("Team not found with ID: " + teamId);
                        return new RuntimeException("Team not found");
                    });
            
            logger.DEBUG("Found team: " + team.getName() + " (current members: " + team.getUsers().size() + ")");
            
            // Find and validate user
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> {
                        logger.ERROR("User not found with ID: " + userId);
                        return new RuntimeException("User " + userId + " not found");
                    });
            
            logger.DEBUG("Found user: " + user.getEmail());
            
            // Check if user is already a member of this team
            boolean userAlreadyMember = team.getUsers().stream()
                    .anyMatch(member -> member.getId() == userId);
            
            if (userAlreadyMember) {
                logger.WARN("User " + userId + " is already a member of team " + teamId);
                throw new RuntimeException("User is already a member of this team");
            }
            
            // Check if user is already in another team for the same hackathon using existing method
            Optional<Team> existingTeam = teamRepository.findFirstByUsers_Id(userId);
            if (existingTeam.isPresent() && existingTeam.get().getHackathon().getId().intValue() == team.getHackathon().getId().intValue()) {
                logger.WARN("User " + userId + " is already in another team for hackathon " + team.getHackathon().getId());
                throw new RuntimeException("User is already in a team for this hackathon");
            }
            
            // Add user to team (managed entity → change tracked)
            team.getUsers().add(user);
            logger.DEBUG("User added to team - team will be automatically saved on transaction commit");
            
            logger.INFO("User " + user.getEmail() + " successfully added to team " + team.getName() + 
                       " (new member count: " + team.getUsers().size() + ")");
            
            return team;  // flush happens on transaction commit
            
        } catch (Exception e) {
            logger.ERROR("Failed to add member to team - teamId: " + teamId + 
                        ", userId: " + userId + ", error: " + e.getMessage());
            logger.SEVERE("Stack trace: " + e.toString());
            throw e;
        }
    }
}

