package com.project.org.persistence.entity;

import com.project.org.persistence.entity.enums.Role;
import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "databases")
@Data
public class DatabaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;

    @ManyToOne
    @JoinColumn(name = "owner_id",
            referencedColumnName = "id",
            nullable = false)
    private UserEntity owner;

    @ElementCollection(fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "database_allowed_roles",
            joinColumns = @JoinColumn(name = "database_id"))
    @Column(name = "role")
    private Set<Role> allowedRoles = new HashSet<>();
}
