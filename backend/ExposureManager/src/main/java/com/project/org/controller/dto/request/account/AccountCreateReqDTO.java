package com.project.org.controller.dto.request.account;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AccountCreateReqDTO {
    @NotBlank
    private String name;
    @NotNull
    private Long portfolioId;
}