package com.project.org.controller.dto.request.policy;

import lombok.Data;

import java.sql.Date;

@Data
public class PolicyCreateReqDTO {
    private String name;
    private Date startDate;
    private Date expirationDate;
    private Long coverage;
    private String perilType;
    private Long accountId;
}
