package com.project.org.controller.dto.request.policy;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.sql.Date;

@Data
public class PolicyCreateReqDTO {
    @NotBlank
    private String name;
    @NotNull
    private Date startDate;
    @NotNull
    private Date expirationDate;
    @NotNull
    private Long coverage;
    @NotNull
    private String perilType;
    @NotNull
    private Long accountId;
}
