package com.project.org.persistence.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "databases")
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
}
