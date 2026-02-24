package com.timekeeping.api.service;

import com.timekeeping.api.config.JwtTokenProvider;
import com.timekeeping.api.dto.AuthRequest;
import com.timekeeping.api.dto.AuthResponse;
import com.timekeeping.api.dto.UserResponse;
import com.timekeeping.api.entity.User;
import com.timekeeping.api.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtTokenProvider tokenProvider;

    public AuthService(UserRepository userRepository, JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.tokenProvider = tokenProvider;
    }

    public AuthResponse register(AuthRequest request) {
        if (userRepository.findByEmail(request.email()).isPresent()) {
            return new AuthResponse(false, null, null, "Email already registered");
        }

        var user = new User(request.name(), request.email(), request.password(), request.department());
        user.encodePassword();

        var savedUser = userRepository.save(user);
        var token = tokenProvider.generateToken(savedUser.getId());
        var userResponse = new UserResponse(
                savedUser.getId(), savedUser.getName(), savedUser.getEmail(), savedUser.getDepartment());

        return new AuthResponse(true, token, userResponse, null);
    }

    public AuthResponse login(AuthRequest request) {
        var userOptional = userRepository.findByEmail(request.email());
        if (userOptional.isEmpty()) {
            return new AuthResponse(false, null, null, "Invalid credentials");
        }

        var user = userOptional.get();
        if (!user.matchPassword(request.password())) {
            return new AuthResponse(false, null, null, "Invalid credentials");
        }

        var token = tokenProvider.generateToken(user.getId());
        var userResponse = new UserResponse(
                user.getId(), user.getName(), user.getEmail(), user.getDepartment());

        return new AuthResponse(true, token, userResponse, null);
    }

    public UserResponse getMe(String userId) {
        return userRepository.findById(userId)
                .map(user -> new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getDepartment()))
                .orElse(null);
    }
}
