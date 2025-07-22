package com.project.org.controller.dto.request.policy;

import com.project.org.controller.dto.request.ReqDTO;
import lombok.Data;

import java.io.Serializable;
import java.sql.Date;

@Data
public class PolicyUpdateReqDTO implements ReqDTO {
    private Long id;
    private String name;
    private Date startDate;
    private Date expirationDate;
    private Long coverage;
    private String perilType;
    private Long accountId;
}
