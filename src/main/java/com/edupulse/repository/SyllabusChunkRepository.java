package com.edupulse.repository;

import com.edupulse.model.SyllabusChunk;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SyllabusChunkRepository extends JpaRepository<SyllabusChunk, Long> {
    List<SyllabusChunk> findByDocumentIdOrderByChunkIndexAsc(Long documentId);
}
