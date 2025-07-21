package com.project.org.controller.dto.request.account;

import com.project.org.controller.dto.request.ReqDTO;
import lombok.Data;

@Data
public class AccountCreateReqDTO implements ReqDTO {
    private String name;
    private Long portfolioId;
}
