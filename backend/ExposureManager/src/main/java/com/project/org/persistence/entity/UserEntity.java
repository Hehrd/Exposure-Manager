package com.project.org.persistence.entity;

import com.project.org.persistence.entity.enums.Role;
import com.project.org.persistence.entity.util.converter.RoleConverter;
import jakarta.persistence.*;
import lombok.Data;

import java.util.List;


@Entity
@Table(name = "users")
@Data
public class UserEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    @Convert(converter = RoleConverter.class)
    private Role role;

    @OneToMany(mappedBy = "owner")
    private List<DatabaseEntity> databases;
}
