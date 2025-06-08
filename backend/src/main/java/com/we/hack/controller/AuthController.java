package com.we.hack.controller;

import com.we.hack.model.User;
import com.we.hack.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) throws IOException {
        try {
            // Validate input
            if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(createErrorResponse("Email is required"));
            }
            if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(createErrorResponse("Password is required"));
            }
            if (user.getUsername() == null || user.getUsername().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(createErrorResponse("Username is required"));
            }
            
            // Check if user already exists
            if (userService.findByEmail(user.getEmail()) != null) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(createErrorResponse("An account with this email already exists. Please use a different email or try logging in."));
            }
            
            User newUser = userService.registerUser(user);
            return ResponseEntity.ok(newUser);
            
        } catch (DataIntegrityViolationException e) {
            // Handle database constraint violations (like duplicate email)
            if (e.getMessage().contains("email")) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(createErrorResponse("An account with this email already exists. Please use a different email or try logging in."));
            }
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(createErrorResponse("Registration failed due to data conflict. Please check your information."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Registration failed. Please try again later."));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginData){
        try {
            // Validate input
            if (loginData.getEmail() == null || loginData.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(createErrorResponse("Email is required"));
            }
            if (loginData.getPassword() == null || loginData.getPassword().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(createErrorResponse("Password is required"));
            }
            
            User user = userService.loginUser(loginData.getEmail(), loginData.getPassword());
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            if (e.getMessage().equals("Invalid credentials")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("Invalid email or password. Please check your credentials and try again."));
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Login failed. Please try again later."));
        }
    }

    // New endpoint to find user by email for team management
    @GetMapping("/user/find-by-email")
    public ResponseEntity<User> findUserByEmail(@RequestParam String email) {
        try {
            User user = userService.findByEmail(email);
            if (user != null) {
                return ResponseEntity.ok(user);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    private Map<String, String> createErrorResponse(String message) {
        Map<String, String> error = new HashMap<>();
        error.put("error", message);
        return error;
    }
}
