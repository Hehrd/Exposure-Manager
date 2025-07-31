package com.project.org.controller.dto.response;

import com.project.org.persistence.entity.enums.JobStatus;
import lombok.Data;

import java.util.Date;

@Data
public class DefaultJobResDTO {
    private Long id;
    private String name;
    private Long timeStartedMillis;
    private Long timeFinishedMillis;
    private JobStatus status;
}
