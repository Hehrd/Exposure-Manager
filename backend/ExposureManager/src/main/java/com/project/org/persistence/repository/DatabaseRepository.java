package com.project.org.persistence.repository;

import com.project.org.persistence.entity.DatabaseEntity;
import com.project.org.persistence.entity.enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DatabaseRepository extends JpaRepository<DatabaseEntity, Long> {

    Page<DatabaseEntity> findAllByOwner_Username(String ownerUsername, Pageable pageable);
    Page<DatabaseEntity> findAllByAllowedRolesContaining(Role role, Pageable pageable);

    Optional<DatabaseEntity> findByIdAndOwner_Username(Long id, String ownerUsername);

    Optional<DatabaseEntity> findByNameAndOwner_Id(String name, Long ownerId);

    Optional<DatabaseEntity> findByName(String name);


    boolean existsByNameAndOwner_Id(String name, Long ownerId);

    void deleteByNameAndOwner_Id(String name, Long ownerId);
}
