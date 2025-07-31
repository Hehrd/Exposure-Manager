package com.project.org.controller.dto.request.job;

import com.project.org.persistence.entity.enums.JobStatus;
import lombok.Data;

@Data
public class JobCreateReqDTO {
    private String name;
    private Long timeStartedMillis;
}
