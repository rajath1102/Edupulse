package com.edupulse.service;

import com.edupulse.dto.PerformanceRequestDTO;
import com.edupulse.dto.PerformanceResponseDTO;
import com.edupulse.exception.BadRequestException;
import com.edupulse.model.Performance;
import com.edupulse.model.Student;
import com.edupulse.repository.PerformanceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service class for managing Student Performance records.
 */
@Service
@Transactional
public class PerformanceService {

    private final PerformanceRepository performanceRepository;
    private final StudentService studentService;

    public PerformanceService(PerformanceRepository performanceRepository, StudentService studentService) {
        this.performanceRepository = performanceRepository;
        this.studentService = studentService;
    }

    /**
     * Add a performance record for a student.
     */
    public PerformanceResponseDTO addPerformance(PerformanceRequestDTO dto) {
        if (dto.getMarks() < 0 || dto.getMarks() > 100) {
            throw new BadRequestException("Marks must be between 0 and 100.");
        }
        if (dto.getAttendance() < 0 || dto.getAttendance() > 100) {
            throw new BadRequestException("Attendance must be between 0 and 100.");
        }

        // Validates that student exists
        Student student = studentService.getStudentById(dto.getStudentId());

        Performance performance = new Performance(
                student,
                dto.getSubject().trim(),
                dto.getMarks(),
                dto.getAttendance()
        );

        Performance saved = performanceRepository.save(performance);

        return mapToResponseDTO(saved);
    }

    /**
     * Retrieve all performance records for a specific student.
     */
    @Transactional(readOnly = true)
    public List<PerformanceResponseDTO> getPerformancesByStudentId(Long studentId) {
        // Verify student exists
        studentService.getStudentById(studentId);

        List<Performance> list = performanceRepository.findByStudentId(studentId);
        return list.stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    private PerformanceResponseDTO mapToResponseDTO(Performance p) {
        return new PerformanceResponseDTO(
                p.getId(),
                p.getStudent().getId(),
                p.getStudent().getName(),
                p.getSubject(),
                p.getMarks(),
                p.getAttendance()
        );
    }
}

