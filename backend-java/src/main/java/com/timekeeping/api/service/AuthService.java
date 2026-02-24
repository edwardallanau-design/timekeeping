package com.timekeeping.api.service;

import com.timekeeping.api.dto.AuthRequest;
import com.timekeeping.api.dto.AuthResponse;
import com.timekeeping.api.dto.UserResponse;
import com.timekeeping.api.entity.User;
import com.timekeeping.api.repository.UserRepository;
import com.timekeeping.api.config.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider tokenProvider;

    public AuthResponse register(AuthRequest request) {
        // Check if user already exists
        Optional<User> existingUser = userRepository.findByEmail(request.getEmail());
        if (existingUser.isPresent()) {
            return new AuthResponse(false, null, null, "Email already registered");
        }

        // Create new user
        User user = new User(
                request.getName(),
                request.getEmail(),
                request.getPassword(),
                request.getDepartment()
        );
        user.encodePassword();

        User savedUser = userRepository.save(user);

        String token = tokenProvider.generateToken(savedUser.getId());
        UserResponse userResponse = new UserResponse(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getDepartment()
        );

        return new AuthResponse(true, token, userResponse, null);
    }

    public AuthResponse login(AuthRequest request) {
        Optional<User> userOptional = userRepository.findByEmail(request.getEmail());
        if (userOptional.isEmpty()) {
            return new AuthResponse(false, null, null, "Invalid credentials");
        }

        User user = userOptional.get();
        if (!user.matchPassword(request.getPassword())) {
            return new AuthResponse(false, null, null, "Invalid credentials");
        }

        String token = tokenProvider.generateToken(user.getId());
        UserResponse userResponse = new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getDepartment()
        );

        return new AuthResponse(true, token, userResponse, null);
    }

    public UserResponse getMe(String userId) {
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isEmpty()) {
            return null;
        }

        User user = userOptional.get();
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getDepartment()
        );
    }
}
