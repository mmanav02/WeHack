package com.we.hack.service.impl;

import com.we.hack.model.User;

public interface UserService {
    User registerUser(User user);
    User loginUser(String email, String password);
}
