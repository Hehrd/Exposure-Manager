package com.project.org.controller.dto.request.job;

import com.project.org.persistence.entity.enums.JobStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class JobFinishDTO {
    @NotNull
    private Long id;
    @NotNull
    private Long timeFinishedMillis;
    @NotNull
    private JobStatus status;
}
