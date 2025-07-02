package com.project.org.persistence.repository;

import com.project.org.persistence.entity.DatabaseEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DatabaseRepository extends JpaRepository<DatabaseEntity, Long> {
}
