package com.timekeeping.presentation.auth;

import com.timekeeping.application.auth.AuthService;
import com.timekeeping.application.auth.LoginCommand;
import com.timekeeping.application.auth.RegisterCommand;
import com.timekeeping.infrastructure.security.UserPrincipal;
import com.timekeeping.presentation.auth.dto.AuthResponse;
import com.timekeeping.presentation.auth.dto.LoginRequest;
import com.timekeeping.presentation.auth.dto.RegisterRequest;
import com.timekeeping.presentation.auth.dto.UserDto;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Authentication endpoints. All business logic is delegated to
 * {@link AuthService} — this controller handles only HTTP concerns
 * (request binding, status codes, response shaping).
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        var result = authService.register(
                new RegisterCommand(request.name(), request.email(), request.password(), request.department()));
        return ResponseEntity.status(HttpStatus.CREATED).body(AuthResponse.from(result));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        var result = authService.login(new LoginCommand(request.email(), request.password()));
        return ResponseEntity.ok(AuthResponse.from(result));
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> getMe(@AuthenticationPrincipal UserPrincipal principal) {
        var userResult = authService.getUser(principal.getId());
        return ResponseEntity.ok(AuthResponse.userOnly(UserDto.from(userResult)));
    }
}
