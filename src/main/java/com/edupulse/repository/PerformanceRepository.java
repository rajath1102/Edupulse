package com.edupulse.repository;

import com.edupulse.model.Performance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA Repository for Performance entity.
 */
@Repository
public interface PerformanceRepository extends JpaRepository<Performance, Long> {

    List<Performance> findByStudentId(Long studentId);

    void deleteByStudentId(Long studentId);
}

