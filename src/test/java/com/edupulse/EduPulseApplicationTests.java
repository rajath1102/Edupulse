package com.edupulse;

import com.edupulse.dto.PerformanceAnalysisDTO;
import com.edupulse.dto.PerformanceRequestDTO;
import com.edupulse.model.Student;
import com.edupulse.service.AnalysisService;
import com.edupulse.service.PerformanceService;
import com.edupulse.service.StudentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class EduPulseApplicationTests {

    @Autowired
    private StudentService studentService;

    @Autowired
    private PerformanceService performanceService;

    @Autowired
    private AnalysisService analysisService;

    @Test
    void contextLoads() {
        assertNotNull(studentService);
        assertNotNull(performanceService);
        assertNotNull(analysisService);
    }

    @Test
    void testStudentCreationAndAnalysis() {
        // Create test student
        Student student = new Student("Test Student", "test.student@example.com", "Computer Engineering", 3);
        Student saved = studentService.createStudent(student);
        assertNotNull(saved.getId());

        // Add 2 performances: 1 weak (<50), 1 good
        performanceService.addPerformance(new PerformanceRequestDTO(saved.getId(), "Data Structures", 40.0, 80.0));
        performanceService.addPerformance(new PerformanceRequestDTO(saved.getId(), "Database Systems", 80.0, 90.0));

        // Analyze
        PerformanceAnalysisDTO analysis = analysisService.analyzeStudentPerformance(saved.getId());
        assertEquals(60.0, analysis.getAverageMarks()); // (40 + 80) / 2 = 60.0
        assertEquals("MEDIUM", analysis.getRiskLevel()); // 50 <= 60 < 75 -> MEDIUM
        assertEquals(85.0, analysis.getAverageAttendance()); // (80 + 90) / 2 = 85.0
        assertTrue(analysis.getWeakSubjects().contains("Data Structures"));
        assertEquals(1, analysis.getWeakSubjects().size());
    }
}

