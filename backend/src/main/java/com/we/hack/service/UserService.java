package com.we.hack.service;

import com.we.hack.model.User;

import java.io.IOException;

public interface UserService {
    User registerUser(User user) throws IOException;
    User loginUser(String email, String password);
}
