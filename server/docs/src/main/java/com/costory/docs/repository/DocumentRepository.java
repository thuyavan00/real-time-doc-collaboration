package com.costory.docs.repository;

import com.costory.docs.entity.DocumentEntity;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DocumentRepository extends JpaRepository<DocumentEntity, UUID> {
    List<DocumentEntity> findAllByOrderByUpdatedAtDesc();
}
