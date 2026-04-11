package com.recruitment.server.controller;

import com.recruitment.server.dto.AuthRequest;
import com.recruitment.server.dto.AuthResponse;
import com.recruitment.server.model.User;
import com.recruitment.server.model.Role;
import com.recruitment.server.repository.UserRepository;
import com.recruitment.server.repository.RoleRepository;
import com.recruitment.server.security.JwtUtil;
import com.recruitment.server.security.Roles;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.recruitment.server.service.CustomUserDetailsService;
import com.recruitment.server.service.EmailService;
import com.recruitment.server.model.Candidate;
import com.recruitment.server.model.PasswordResetToken;
import com.recruitment.server.repository.CandidateRepository;
import com.recruitment.server.repository.PasswordResetTokenRepository;

import java.util.Map;
import java.util.UUID;
import java.time.LocalDateTime;
import java.util.HashMap;

import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.ExampleObject;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepo;
    private final RoleRepository roleRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;
    private final EmailService emailService;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final CandidateRepository candidateRepository;

    public AuthController(AuthenticationManager authenticationManager,
            UserRepository userRepo,
            RoleRepository roleRepo,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil,
            CustomUserDetailsService userDetailsService,
            EmailService emailService,
            PasswordResetTokenRepository passwordResetTokenRepository,
            CandidateRepository candidateRepository) {
        this.authenticationManager = authenticationManager;
        this.userRepo = userRepo;
        this.roleRepo = roleRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
        this.emailService = emailService;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.candidateRepository = candidateRepository;
    }

    @PostMapping("/register")
    @io.swagger.v3.oas.annotations.parameters.RequestBody(required = true, content = @Content(mediaType = "application/json", schema = @Schema(implementation = User.class), examples = @ExampleObject(name = "Register", value = "{\"email\":\"candidate1@hireflow.com\",\"password\":\"Candidate@123\",\"firstName\":\"Cathy\",\"lastName\":\"Candidate\",\"phone\":\"+919876543210\"}")))
    public ResponseEntity<?> register(@RequestBody User user, HttpServletRequest request,
            HttpServletResponse response) {
        if (userRepo.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already in use");
        }

        // Always assign default role
        Role role = roleRepo.findByRoleName(Roles.CANDIDATE);
        if (role == null) {
            role = Role.builder().roleName(Roles.CANDIDATE).build();
            roleRepo.save(role);
        }
        user.setRole(role);

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepo.save(user);

        // Generate JWT and set cookie
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails);
        long expiresAt = jwtUtil.getExpirationDateFromToken(token).getTime();

        response.addCookie(createJwtCookie(token, expiresAt, request.isSecure()));

        AuthResponse authResponse = new AuthResponse(
                user.getFirstName() + " " + user.getLastName(),
                user.getEmail(),
                role.getRoleName().toUpperCase(),
                user.getUserId(),
                false);
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/login")
    @io.swagger.v3.oas.annotations.parameters.RequestBody(required = true, content = @Content(mediaType = "application/json", schema = @Schema(implementation = AuthRequest.class), examples = @ExampleObject(name = "Login", value = "{\"email\":\"admin@hireflow.com\",\"password\":\"Admin@123\"}")))
    public ResponseEntity<?> login(@RequestBody AuthRequest loginRequest, HttpServletRequest request,
            HttpServletResponse response) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

            User user = userRepo.findByEmail(loginRequest.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String token = jwtUtil.generateToken(userDetails);
            long expiresAt = jwtUtil.getExpirationDateFromToken(token).getTime();

            response.addCookie(createJwtCookie(token, expiresAt, request.isSecure()));

            AuthResponse authResponse = new AuthResponse(
                    user.getFirstName() + " " + user.getLastName(),
                    user.getEmail(),
                    user.getRole().getRoleName().toUpperCase(),
                    user.getUserId(),
                    user.getRequiresPasswordChange() != null && user.getRequiresPasswordChange());

            return ResponseEntity.ok(authResponse);
        } catch (BadCredentialsException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password");
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@CookieValue(value = "token", required = false) String token) {
        if (token == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        String email = jwtUtil.getUsernameFromToken(token);
        UserDetails userDetails = userDetailsService.loadUserByUsername(email);

        if (!jwtUtil.validateToken(token, userDetails)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(new AuthResponse(
                user.getFirstName() + " " + user.getLastName(),
                user.getEmail(),
                user.getRole().getRoleName().toUpperCase(),
                user.getUserId(),
                user.getRequiresPasswordChange() != null && user.getRequiresPasswordChange()));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        Cookie cookie = new Cookie("token", null);
        cookie.setHttpOnly(true);
        cookie.setSecure(request.isSecure());
        cookie.setPath("/");
        cookie.setMaxAge(0);
        cookie.setAttribute("SameSite", "Lax");
        response.addCookie(cookie);

        return ResponseEntity.ok("Logged out successfully");
    }

    @GetMapping("/check")
    public ResponseEntity<?> checkAuth(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        String email = authentication.getName();
        User user = userRepo.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        AuthResponse authResponse = new AuthResponse(
                user.getFirstName() + " " + user.getLastName(),
                user.getEmail(),
                user.getRole().getRoleName().toUpperCase(),
                user.getUserId(),
                user.getRequiresPasswordChange() != null && user.getRequiresPasswordChange());

        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/change-password")
    @io.swagger.v3.oas.annotations.parameters.RequestBody(required = true, content = @Content(mediaType = "application/json", schema = @Schema(implementation = Map.class), examples = @ExampleObject(name = "ChangePassword", value = "{\"newPassword\":\"NewPass@123\"}")))
    public ResponseEntity<?> changePassword(
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        String email = authentication.getName();
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String newPassword = request.get("newPassword");
        if (newPassword == null || newPassword.isEmpty()) {
            return ResponseEntity.badRequest().body("New password is required");
        }

        // Update password and clear requiresPasswordChange flag
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setRequiresPasswordChange(false);
        user.setUpdatedAt(java.time.LocalDateTime.now());
        userRepo.save(user);

        return ResponseEntity.ok(new java.util.HashMap<String, String>() {
            {
                put("message", "Password changed successfully");
            }
        });
    }

    private Cookie createJwtCookie(String token, long expiresAt, boolean secure) {
        Cookie cookie = new Cookie("token", token);
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // Changed from secure parameter
        cookie.setPath("/");
        cookie.setMaxAge((int) ((expiresAt - System.currentTimeMillis()) / 1000));
        return cookie;
    }
}
