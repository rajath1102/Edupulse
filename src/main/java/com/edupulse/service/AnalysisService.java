package com.edupulse.service;

import com.edupulse.dto.PerformanceAnalysisDTO;
import com.edupulse.model.Performance;
import com.edupulse.model.Student;
import com.edupulse.repository.PerformanceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

/**
 * Service class for computing academic performance metrics and risk assessments.
 */
@Service
@Transactional(readOnly = true)
public class AnalysisService {

    private final StudentService studentService;
    private final PerformanceRepository performanceRepository;

    public AnalysisService(StudentService studentService, PerformanceRepository performanceRepository) {
        this.studentService = studentService;
        this.performanceRepository = performanceRepository;
    }

    /**
     * Compute comprehensive performance analysis for a given student ID.
     * Risk Rules:
     * - Average Marks >= 75: LOW
     * - Average Marks >= 50 and < 75: MEDIUM
     * - Average Marks < 50: HIGH
     * Weak Subject: marks < 50
     */
    public PerformanceAnalysisDTO analyzeStudentPerformance(Long studentId) {
        Student student = studentService.getStudentById(studentId);
        List<Performance> performances = performanceRepository.findByStudentId(studentId);

        if (performances.isEmpty()) {
            return new PerformanceAnalysisDTO(
                    student.getId(),
                    student.getName(),
                    0.0,
                    new ArrayList<>(),
                    0.0,
                    "NO_DATA",
                    0
            );
        }

        double totalMarks = 0.0;
        double totalAttendance = 0.0;
        List<String> weakSubjects = new ArrayList<>();

        for (Performance p : performances) {
            totalMarks += p.getMarks();
            totalAttendance += p.getAttendance();

            // A weak subject means marks below 50
            if (p.getMarks() < 50.0) {
                weakSubjects.add(p.getSubject());
            }
        }

        int count = performances.size();
        double avgMarks = roundToTwoDecimals(totalMarks / count);
        double avgAttendance = roundToTwoDecimals(totalAttendance / count);

        // Determine Risk Level based on Average Marks
        String riskLevel;
        if (avgMarks >= 75.0) {
            riskLevel = "LOW";
        } else if (avgMarks >= 50.0) {
            riskLevel = "MEDIUM";
        } else {
            riskLevel = "HIGH";
        }

        return new PerformanceAnalysisDTO(
                student.getId(),
                student.getName(),
                avgMarks,
                weakSubjects,
                avgAttendance,
                riskLevel,
                count
        );
    }

    private double roundToTwoDecimals(double value) {
        return BigDecimal.valueOf(value)
                .setScale(2, RoundingMode.HALF_UP)
                .doubleValue();
    }
}

