package com.timekeeping.application.auth;

import com.timekeeping.domain.user.User;
import com.timekeeping.domain.user.UserRegisteredEvent;
import com.timekeeping.domain.user.UserRepository;
import com.timekeeping.infrastructure.security.JwtTokenProvider;
import com.timekeeping.shared.exception.DuplicateResourceException;
import com.timekeeping.shared.exception.ResourceNotFoundException;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Core authentication service. Orchestrates user creation and login,
 * publishing domain events for downstream listeners (audit, notification, etc.)
 * without coupling to any of those concerns.
 */
@Service
@Transactional
class AuthServiceImpl implements AuthService {

    private final UserRepository           userRepository;
    private final PasswordEncoder          passwordEncoder;
    private final JwtTokenProvider         tokenProvider;
    private final ApplicationEventPublisher eventPublisher;

    AuthServiceImpl(UserRepository userRepository,
                    PasswordEncoder passwordEncoder,
                    JwtTokenProvider tokenProvider,
                    ApplicationEventPublisher eventPublisher) {
        this.userRepository  = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider   = tokenProvider;
        this.eventPublisher  = eventPublisher;
    }

    @Override
    public AuthResult register(RegisterCommand command) {
        if (userRepository.existsByEmail(command.email())) {
            throw new DuplicateResourceException("Email is already registered");
        }

        var encodedPassword = passwordEncoder.encode(command.password());
        var user            = new User(command.name(), command.email(), encodedPassword, command.department());
        var savedUser       = userRepository.save(user);

        eventPublisher.publishEvent(
                new UserRegisteredEvent(this, savedUser.getId(), savedUser.getEmail(), savedUser.getName()));

        return new AuthResult(tokenProvider.generateToken(savedUser.getId()), UserResult.from(savedUser));
    }

    @Override
    public AuthResult login(LoginCommand command) {
        var user = userRepository.findByEmail(command.email())
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        if (!passwordEncoder.matches(command.password(), user.getPassword())) {
            throw new BadCredentialsException("Invalid credentials");
        }

        return new AuthResult(tokenProvider.generateToken(user.getId()), UserResult.from(user));
    }

    @Override
    @Transactional(readOnly = true)
    public UserResult getUser(String userId) {
        return userRepository.findById(userId)
                .map(UserResult::from)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
