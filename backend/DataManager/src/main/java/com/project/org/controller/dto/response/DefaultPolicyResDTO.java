package com.project.org.controller.dto.response;

import lombok.Data;

import java.sql.Date;

@Data
public class DefaultPolicyResDTO {
    private Long id;
    private String name;
    private Date startDate;
    private Date expirationDate;
    private Long coverage;
    private String perilType;
    private Long accountId;
}
