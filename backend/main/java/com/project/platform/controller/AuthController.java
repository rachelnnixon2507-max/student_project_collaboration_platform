package com.project.platform.controller;

import com.project.platform.dto.request.AdminLoginRequest;
import com.project.platform.dto.response.ApiResponse;
import com.project.platform.dto.response.AuthResponse;
import com.project.platform.entity.User;
import com.project.platform.entity.enums.Role;
import com.project.platform.repository.UserRepository;
import com.project.platform.security.JwtUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    @PostMapping("/admin/login")
    public ApiResponse<AuthResponse> adminLogin(@Valid @RequestBody AdminLoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
            );

            User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

            if (user.getRole() != Role.ADMIN) {
                throw new BadCredentialsException("This account does not have administrator access");
            }

            String token = jwtUtil.generateToken(user.getEmail(), user.getId(), user.getRole().name());
            AuthResponse response = new AuthResponse(
                token,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name()
            );

            return ApiResponse.ok("Admin login successful", response);
        } catch (BadCredentialsException ex) {
            throw new org.springframework.web.server.ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                ex.getMessage()
            );
        }
    }
}
