package com.recruitment.server.controller;

import com.recruitment.server.dto.AuthRequest;
import com.recruitment.server.dto.AuthResponse;
import com.recruitment.server.model.User;
import com.recruitment.server.model.Role;
import com.recruitment.server.repository.UserRepository;
import com.recruitment.server.repository.RoleRepository;
import com.recruitment.server.security.JwtUtil;

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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepo;
    private final RoleRepository roleRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;

    public AuthController(AuthenticationManager authenticationManager,
            UserRepository userRepo,
            RoleRepository roleRepo,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil,
            CustomUserDetailsService userDetailsService) {
        this.authenticationManager = authenticationManager;
        this.userRepo = userRepo;
        this.roleRepo = roleRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user, HttpServletRequest request,
            HttpServletResponse response) {
        if (userRepo.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already in use");
        }

        // Always assign default role
        Role role = roleRepo.findByRoleName("USER");
        if (role == null) {
            role = Role.builder().roleName("USER").build();
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
                role.getRoleName(),
                user.getUserId());
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/login")
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

            return ResponseEntity.ok(new AuthResponse(
                    user.getFirstName() + " " + user.getLastName(),
                    user.getEmail(),
                    user.getRole().getRoleName(),
                    user.getUserId()));
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
                user.getRole().getRoleName(),
                user.getUserId()));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        Cookie cookie = new Cookie("token", null);
        cookie.setHttpOnly(true);
        cookie.setSecure(request.isSecure());
        cookie.setPath("/");
        cookie.setMaxAge(0);
        cookie.setAttribute("SameSite", "Strict");
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
                user.getRole().getRoleName(),
                user.getUserId());

        return ResponseEntity.ok(authResponse);
    }

    private Cookie createJwtCookie(String token, long expiresAt, boolean secure) {
        Cookie cookie = new Cookie("token", token);
        cookie.setHttpOnly(true);
        cookie.setSecure(secure);
        cookie.setPath("/");
        cookie.setMaxAge((int) ((expiresAt - System.currentTimeMillis()) / 1000));
        cookie.setAttribute("SameSite", "Strict");
        return cookie;
    }
}
