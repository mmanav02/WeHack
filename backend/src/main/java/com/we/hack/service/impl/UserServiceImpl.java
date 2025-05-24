package com.we.hack.service.impl;
import com.we.hack.model.User;
import com.we.hack.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public User registerUser(User user) {
        return userRepository.save(user); // hash password here
    }

    @Override
    public User loginUser(String email, String password){
        Optional<User> user = userRepository.findByEmail(email);
        if(user.isPresent() && user.get().getPassword().equals(password)){
            return user.get();
        }

        throw new RuntimeException("Invalid credentials");
    }



}
