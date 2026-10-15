package com.edupulse.service;

import com.edupulse.dto.AuthResponseDTO;
import com.edupulse.dto.LoginRequestDTO;
import com.edupulse.dto.RegisterRequestDTO;
import com.edupulse.dto.UserSummaryDTO;
import com.edupulse.exception.BadRequestException;
import com.edupulse.model.Role;
import com.edupulse.model.Student;
import com.edupulse.model.User;
import com.edupulse.repository.StudentRepository;
import com.edupulse.repository.UserRepository;
import com.edupulse.security.JwtTokenProvider;
import com.edupulse.security.UserPrincipal;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service managing user authentication, registration, password hashing, and JWT token issuance.
 */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    public AuthService(UserRepository userRepository, StudentRepository studentRepository,
                       PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
    }

    @Transactional
    public AuthResponseDTO register(RegisterRequestDTO request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username is already taken: " + request.getUsername());
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered: " + request.getEmail());
        }

        // Security: Public self-registration is strictly restricted to ROLE_STUDENT
        // Administrator or Teacher accounts cannot be created via public registration
        Role role = Role.ROLE_STUDENT;

        Student linkedStudent = null;
        linkedStudent = studentRepository.findByEmail(request.getEmail()).orElse(null);
        if (linkedStudent == null) {
            String studentName = (request.getName() != null && !request.getName().isBlank())
                    ? request.getName() : request.getUsername();
            String course = (request.getCourse() != null && !request.getCourse().isBlank())
                    ? request.getCourse() : "Computer Science";
            Integer year = request.getYear() != null ? request.getYear() : 1;
            linkedStudent = studentRepository.save(new Student(studentName, request.getEmail(), course, year));
        }

        User user = new User(
                request.getUsername(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                role,
                linkedStudent
        );

        userRepository.save(user);

        UserPrincipal userPrincipal = UserPrincipal.create(user);
        String token = tokenProvider.generateTokenFromUserPrincipal(userPrincipal);
        Long studentId = linkedStudent != null ? linkedStudent.getId() : null;

        return new AuthResponseDTO(
                token,
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                studentId,
                "Registration successful"
        );
    }

    public AuthResponseDTO login(LoginRequestDTO request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsernameOrEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();

        return new AuthResponseDTO(
                jwt,
                principal.getId(),
                principal.getUsername(),
                principal.getEmail(),
                principal.getRole(),
                principal.getStudentId(),
                "Login successful"
        );
    }

    public UserSummaryDTO getCurrentUserSummary() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal principal)) {
            throw new BadRequestException("No authenticated user session found");
        }

        String studentName = null;
        if (principal.getStudentId() != null) {
            studentName = studentRepository.findById(principal.getStudentId())
                    .map(Student::getName)
                    .orElse(null);
        }

        return new UserSummaryDTO(
                principal.getId(),
                principal.getUsername(),
                principal.getEmail(),
                principal.getRole(),
                principal.getStudentId(),
                studentName
        );
    }
}
