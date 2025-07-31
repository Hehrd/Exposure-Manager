package com.project.org.persistence.repository;

import com.project.org.persistence.entity.JobEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JobRepository extends JpaRepository<JobEntity, Long> {
    Page<JobEntity> findAllByOwner_Id(Long ownerId, Pageable pageable);
}
