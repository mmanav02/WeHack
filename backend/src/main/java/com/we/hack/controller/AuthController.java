package com.we.hack.controller;

import com.we.hack.model.User;
import com.we.hack.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public User register(@RequestBody User user) throws IOException {
        return userService.registerUser(user);
    }

    @PostMapping("/login")
    public User login(@RequestBody User loginData){
        return userService.loginUser(loginData.getEmail(), loginData.getPassword());
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

}
