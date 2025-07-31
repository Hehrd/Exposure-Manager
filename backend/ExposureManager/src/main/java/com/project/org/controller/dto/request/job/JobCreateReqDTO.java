package com.project.org.controller.dto.request.job;

import com.project.org.persistence.entity.enums.JobStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class JobCreateReqDTO {
    @NotBlank
    private String name;
    @NotNull
    private Long timeStartedMillis;
}
