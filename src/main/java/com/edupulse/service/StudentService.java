package com.edupulse.service;

import com.edupulse.exception.BadRequestException;
import com.edupulse.exception.ResourceNotFoundException;
import com.edupulse.model.Student;
import com.edupulse.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service class for managing Student business logic.
 */
@Service
@Transactional
public class StudentService {

    private final StudentRepository studentRepository;

    public StudentService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    /**
     * Register a new student.
     */
    public Student createStudent(Student student) {
        if (studentRepository.existsByEmail(student.getEmail())) {
            throw new BadRequestException("Student with email '" + student.getEmail() + "' already exists.");
        }
        return studentRepository.save(student);
    }

    /**
     * Retrieve all students.
     */
    @Transactional(readOnly = true)
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    /**
     * Retrieve a student by primary key ID.
     */
    @Transactional(readOnly = true)
    public Student getStudentById(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + id));
    }

    /**
     * Update an existing student's details.
     */
    public Student updateStudent(Long id, Student updatedStudent) {
        Student existingStudent = getStudentById(id);

        // Check if new email is taken by another student
        if (!existingStudent.getEmail().equalsIgnoreCase(updatedStudent.getEmail()) &&
                studentRepository.existsByEmail(updatedStudent.getEmail())) {
            throw new BadRequestException("Email '" + updatedStudent.getEmail() + "' is already in use by another student.");
        }

        existingStudent.setName(updatedStudent.getName());
        existingStudent.setEmail(updatedStudent.getEmail());
        existingStudent.setCourse(updatedStudent.getCourse());
        existingStudent.setYear(updatedStudent.getYear());

        return studentRepository.save(existingStudent);
    }

    /**
     * Delete a student by ID.
     */
    public void deleteStudent(Long id) {
        Student student = getStudentById(id);
        studentRepository.delete(student);
    }
}

