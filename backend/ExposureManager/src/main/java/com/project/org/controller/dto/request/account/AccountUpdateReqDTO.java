package com.project.org.controller.dto.request.account;

import lombok.Data;

@Data
public class AccountUpdateReqDTO {
    private Long id;
    private String name;
    private Long portfolioId;
}