package com.we.hack.service.impl;

import com.we.hack.model.User;

import java.io.IOException;

public interface UserService {
    User registerUser(User user) throws IOException;
    User loginUser(String email, String password);
}
