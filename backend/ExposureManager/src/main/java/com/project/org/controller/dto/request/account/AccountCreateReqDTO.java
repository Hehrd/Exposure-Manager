package com.project.org.controller.dto.request.account;

import lombok.Data;

@Data
public class AccountCreateReqDTO {
    private String name;
    private Long portfolioId;
}