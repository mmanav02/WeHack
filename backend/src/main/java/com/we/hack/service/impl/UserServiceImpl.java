package com.we.hack.service.impl;
import com.we.hack.model.User;
import com.we.hack.repository.UserRepository;
import com.we.hack.service.UserService;
import com.we.hack.service.logger.Logger;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {
    
    private static Logger logger;
    
    static {
        try {
            logger = Logger.getInstance(100);
            System.out.println("UserServiceImpl logger initialized successfully");
        } catch (IOException e) {
            System.err.println("Failed to initialize logger in UserServiceImpl: " + e.getMessage());
            logger = null; // Set to null so we can handle gracefully
        }
    }
    
    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
        if (logger != null) {
            logger.INFO("UserServiceImpl initialized with repository");
        } else {
            System.out.println("UserServiceImpl initialized with repository (logger disabled)");
        }
    }

    @Override
    public User registerUser(User user) throws IOException {
        if (logger != null) {
            logger.INFO("UserService.registerUser() - Registering new user with email: " + user.getEmail());
            logger.DEBUG("User details: username=" + user.getUsername() + ", email=" + user.getEmail());
        }
        
        try {
            // Check if user already exists
            Optional<User> existingUser = userRepository.findByEmail(user.getEmail());
            if (existingUser.isPresent()) {
                if (logger != null) {
                    logger.WARN("User registration failed - email already exists: " + user.getEmail());
                }
                throw new RuntimeException("User with this email already exists");
            }
            
            if (logger != null) {
                logger.DEBUG("Email validation passed - proceeding with user registration");
            }
            
            // TODO: Hash password here in production
            User savedUser = userRepository.save(user);
            if (logger != null) {
                logger.INFO("User registered successfully with ID: " + savedUser.getId() + ", email: " + savedUser.getEmail());
            }
            
            return savedUser;
            
        } catch (Exception e) {
            if (logger != null) {
                logger.ERROR("Failed to register user - email: " + user.getEmail() + ", error: " + e.getMessage());
                logger.SEVERE("Stack trace: " + e.toString());
            }
            throw e;
        }
    }

    @Override
    public User loginUser(String email, String password){
        if (logger != null) {
            logger.INFO("UserService.loginUser() - Login attempt for email: " + email);
            logger.DEBUG("Attempting authentication for user: " + email);
        }
        
        try {
            Optional<User> user = userRepository.findByEmail(email);
            if(user.isPresent()) {
                if (logger != null) {
                    logger.DEBUG("User found in database: " + email);
                }
                
                if (user.get().getPassword().equals(password)) {
                    if (logger != null) {
                        logger.INFO("Login successful for user: " + email + " (ID: " + user.get().getId() + ")");
                    }
                    return user.get();
                } else {
                    if (logger != null) {
                        logger.WARN("Login failed - invalid password for email: " + email);
                    }
                    throw new RuntimeException("Invalid credentials");
                }
            } else {
                if (logger != null) {
                    logger.WARN("Login failed - user not found with email: " + email);
                }
                throw new RuntimeException("Invalid credentials");
            }
            
        } catch (Exception e) {
            if (logger != null) {
                logger.ERROR("Login error for email: " + email + ", error: " + e.getMessage());
            }
            throw e;
        }
    }

    @Override
    public User findByEmail(String email) {
        if (logger != null) {
            logger.INFO("UserService.findByEmail() - Finding user with email: " + email);
        }
        
        try {
            Optional<User> user = userRepository.findByEmail(email);
            if (user.isPresent()) {
                if (logger != null) {
                    logger.DEBUG("User found: " + user.get().getUsername() + " (ID: " + user.get().getId() + ")");
                }
                return user.get();
            } else {
                if (logger != null) {
                    logger.DEBUG("User not found with email: " + email);
                }
                return null;
            }
            
        } catch (Exception e) {
            if (logger != null) {
                logger.ERROR("Failed to find user by email: " + email + ", error: " + e.getMessage());
            }
            throw e;
        }
    }
}
