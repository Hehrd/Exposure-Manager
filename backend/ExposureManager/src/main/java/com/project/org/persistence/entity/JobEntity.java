package com.project.org.persistence.entity;

import com.project.org.persistence.entity.enums.JobStatus;
import com.project.org.persistence.entity.util.converter.JobStatusConverter;
import jakarta.persistence.*;
import lombok.Data;

import java.util.Date;

@Entity
@Table(name = "jobs")
@Data
public class JobEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Long timeStartedMillis;

    @Column
    private Long timeFinishedMillis;

    @Column(nullable = false)
    @Convert(converter = JobStatusConverter.class)
    private JobStatus status;

    @ManyToOne
    @JoinColumn(name = "ownerId")
    private UserEntity owner;
}
