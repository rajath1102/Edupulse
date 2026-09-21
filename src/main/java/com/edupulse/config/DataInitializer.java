package com.edupulse.config;

import com.edupulse.model.Performance;
import com.edupulse.model.Student;
import com.edupulse.repository.PerformanceRepository;
import com.edupulse.repository.StudentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * Initializes realistic sample student and performance data on first startup.
 * Makes the application immediately demo-ready for college placement presentations.
 */
@Configuration
public class DataInitializer {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Bean
    public CommandLineRunner initSampleData(StudentRepository studentRepository,
                                            PerformanceRepository performanceRepository) {
        return args -> {
            if (studentRepository.count() == 0) {
                logger.info("Database is empty. Seeding initial sample data for EduPulse...");

                // Student 1: John Doe (Moderate / Medium Risk student with a weak subject)
                Student john = new Student("John Doe", "john.doe@example.com", "Computer Science", 3);
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

                logger.info("Sample data initialized successfully with 3 students and 10 performance records!");
            } else {
                logger.info("Existing student data detected. Skipping sample data initialization.");
            }
        };
    }
}

