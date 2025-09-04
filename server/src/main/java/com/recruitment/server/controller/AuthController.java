package com.recruitment.server.controller;



import com.recruitment.server.dto.AuthRequest;
import com.recruitment.server.dto.AuthResponse;
import com.recruitment.server.model.User;
import com.recruitment.server.model.Role;
import com.recruitment.server.repository.UserRepository;
import com.recruitment.server.repository.RoleRepository;
import com.recruitment.server.security.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.recruitment.server.service.CustomUserDetailsService;


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
    public ResponseEntity<?> register(@RequestBody User user) {
        if (userRepo.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already in use");
        }

        // assign default role if not set (e.g., ROLE_USER)
        if (user.getRole() == null) {
            Role role = roleRepo.findByRoleName("USER");
            if (role == null) {
                // create default role
                role = Role.builder().roleName("USER").build();
                roleRepo.save(role);
            }
            user.setRole(role);
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepo.save(user);

        return ResponseEntity.ok("User registered successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }

        // load user details and generate token
        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        String token = jwtUtil.generateToken(userDetails);
        long expiresAt = jwtUtil.getExpirationDateFromToken(token).getTime();

        AuthResponse response = new AuthResponse(token, "Bearer", expiresAt);
        return ResponseEntity.ok(response);
    }
}
