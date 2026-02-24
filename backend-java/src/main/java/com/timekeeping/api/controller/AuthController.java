package com.timekeeping.api.controller;

import com.timekeeping.api.dto.AuthRequest;
import com.timekeeping.api.dto.AuthResponse;
import com.timekeeping.api.dto.ErrorResponse;
import com.timekeeping.api.security.UserPrincipal;
import com.timekeeping.api.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody AuthRequest request) {
        try {
            if (request.name() == null || request.email() == null || request.password() == null) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse(false, "Please provide all required fields"));
            }

            var response = authService.register(request);

            if (!response.success()) {
                return ResponseEntity.badRequest().body(response);
            }

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest request) {
        try {
            if (request.email() == null || request.password() == null) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse(false, "Please provide email and password"));
            }

            var response = authService.login(request);

            if (!response.success()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe() {
        try {
            var authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal userPrincipal)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ErrorResponse(false, "Not authorized to access this route"));
            }

            var userResponse = authService.getMe(userPrincipal.getId());
            if (userResponse == null) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok(new AuthResponse(true, null, userResponse, null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(false, e.getMessage()));
        }
    }
}
