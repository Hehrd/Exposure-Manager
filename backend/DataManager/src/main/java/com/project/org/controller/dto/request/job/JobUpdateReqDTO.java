package com.project.org.controller.dto.request.job;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class JobUpdateReqDTO {
    private Long id;
    private Long timeFinishedMillis;
    private JobStatus status;
}
