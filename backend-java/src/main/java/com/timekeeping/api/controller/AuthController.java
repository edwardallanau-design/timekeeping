package com.timekeeping.api.controller;

import com.timekeeping.api.dto.AuthRequest;
import com.timekeeping.api.dto.AuthResponse;
import com.timekeeping.api.dto.ErrorResponse;
import com.timekeeping.api.dto.UserResponse;
import com.timekeeping.api.security.UserPrincipal;
import com.timekeeping.api.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody AuthRequest request) {
        try {
            if (request.getName() == null || request.getEmail() == null || request.getPassword() == null) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse(false, "Please provide all required fields"));
            }

            AuthResponse response = authService.register(request);

            if (!response.isSuccess()) {
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
            if (request.getEmail() == null || request.getPassword() == null) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse(false, "Please provide email and password"));
            }

            AuthResponse response = authService.login(request);

            if (!response.isSuccess()) {
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
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ErrorResponse(false, "Not authorized to access this route"));
            }

            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            UserResponse userResponse = authService.getMe(userPrincipal.getId());

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
