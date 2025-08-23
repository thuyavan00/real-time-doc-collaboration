package com.costory.docs.repository;

import com.costory.docs.entity.DocumentOpEntity;
import com.costory.docs.entity.DocumentEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DocumentOpRepository extends JpaRepository<DocumentOpEntity, Long> {
    List<DocumentOpEntity> findByDocAndBaseVersionGreaterThanOrderByIdAsc(DocumentEntity doc, long baseVersion);
    long countByDoc(DocumentEntity doc);
}
