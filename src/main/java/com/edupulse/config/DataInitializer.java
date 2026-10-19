package com.edupulse.config;

import com.edupulse.model.Performance;
import com.edupulse.model.Role;
import com.edupulse.model.Student;
import com.edupulse.model.User;
import com.edupulse.repository.PerformanceRepository;
import com.edupulse.repository.StudentRepository;
import com.edupulse.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

/**
 * Initializes realistic sample student and performance data on first startup.
 * Seeds development demo user accounts (Admin, Teacher, Student) when app.demo.accounts.enabled is true.
 */
@Configuration
public class DataInitializer {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Value("${app.demo.accounts.enabled:true}")
    private boolean demoAccountsEnabled;

    @Bean
    public CommandLineRunner initSampleData(StudentRepository studentRepository,
                                            PerformanceRepository performanceRepository,
                                            UserRepository userRepository,
                                            PasswordEncoder passwordEncoder) {
        return args -> {
            Student john = null;

            if (studentRepository.count() == 0) {
                logger.info("Database is empty. Seeding initial sample student and performance data...");

                // Student 1: John Doe (Moderate / Medium Risk student with a weak subject)
                john = new Student("John Doe", "john.doe@example.com", "Computer Science", 3);
                studentRepository.save(john);

                Performance p1 = new Performance(john, "Data Structures & Algorithms", 45.0, 72.0); // Weak subject (< 50)
                Performance p2 = new Performance(john, "Database Management Systems", 68.0, 85.0);
                Performance p3 = new Performance(john, "Computer Networks", 74.0, 80.0);
                Performance p4 = new Performance(john, "Operating Systems", 62.0, 78.0);
                performanceRepository.saveAll(List.of(p1, p2, p3, p4));

                // Student 2: Jane Smith (High Performer / Low Risk)
                Student jane = new Student("Jane Smith", "jane.smith@example.com", "Information Technology", 4);
                studentRepository.save(jane);

                Performance p5 = new Performance(jane, "Machine Learning", 88.0, 92.0);
                Performance p6 = new Performance(jane, "Cloud Computing", 82.0, 90.0);
                Performance p7 = new Performance(jane, "Software Engineering", 85.0, 95.0);
                performanceRepository.saveAll(List.of(p5, p6, p7));

                // Student 3: Alex Brown (High Risk student with multiple weak subjects)
                Student alex = new Student("Alex Brown", "alex.brown@example.com", "Computer Science", 2);
                studentRepository.save(alex);

                Performance p8 = new Performance(alex, "Mathematics II", 35.0, 55.0); // Weak
                Performance p9 = new Performance(alex, "Object-Oriented Programming", 42.0, 60.0); // Weak
                Performance p10 = new Performance(alex, "Digital Electronics", 48.0, 65.0); // Weak
                performanceRepository.saveAll(List.of(p8, p9, p10));

                logger.info("Sample academic data initialized successfully with 3 students and 10 performance records!");
            }

            if (john == null) {
                john = studentRepository.findByEmail("john.doe@example.com").orElse(null);
            }
            Student jane = studentRepository.findByEmail("jane.smith@example.com").orElse(null);
            Student alex = studentRepository.findByEmail("alex.brown@example.com")
                    .or(() -> studentRepository.findByEmail("alex.rivera@example.com"))
                    .orElse(null);

            // Seed development demo accounts if enabled
            if (demoAccountsEnabled) {
                logger.info("Verifying and seeding development demo user accounts...");

                if (!userRepository.existsByUsername("admin")) {
                    userRepository.save(new User("admin", "admin@edupulse.com", passwordEncoder.encode("admin123"), Role.ROLE_ADMIN));
                }
                if (!userRepository.existsByUsername("teacher")) {
                    userRepository.save(new User("teacher", "teacher@edupulse.com", passwordEncoder.encode("teacher123"), Role.ROLE_TEACHER));
                }
                if (!userRepository.existsByUsername("student") && john != null) {
                    userRepository.save(new User("student", "student@edupulse.com", passwordEncoder.encode("student123"), Role.ROLE_STUDENT, john));
                }
                if (!userRepository.existsByUsername("jane") && jane != null) {
                    userRepository.save(new User("jane", "jane.smith@example.com", passwordEncoder.encode("student123"), Role.ROLE_STUDENT, jane));
                }
                if (!userRepository.existsByUsername("alex") && alex != null) {
                    userRepository.save(new User("alex", "alex.rivera@example.com", passwordEncoder.encode("student123"), Role.ROLE_STUDENT, alex));
                }

                logger.info("Demo accounts ready: admin/admin123, teacher/teacher123, student/student123, jane/student123, alex/student123");
            }
        };
    }
}
