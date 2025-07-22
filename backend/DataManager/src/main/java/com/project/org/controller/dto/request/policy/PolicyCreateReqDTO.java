package com.project.org.controller.dto.request.policy;

import com.project.org.controller.dto.request.ReqDTO;
import lombok.Data;

import java.io.Serializable;
import java.sql.Date;


@Data
public class PolicyCreateReqDTO implements ReqDTO {
    private String name;
    private Date startDate;
    private Date expirationDate;
    private Long coverage;
    private String perilType;
    private Long accountId;
}
