package com.project.org.controller.dto.request.account;

import com.project.org.controller.dto.request.ReqDTO;
import lombok.Data;

@Data
public class AccountDeleteReqDTO implements ReqDTO {
    private Long id;
    private String databaseName;
}
