package com.project.org.controller.dto.request.job;

import com.project.org.persistence.entity.enums.JobStatus;
import lombok.Data;

@Data
public class JobFinishDTO {
    private Long id;
    private Long timeFinishedMillis;
    private JobStatus status;
}
