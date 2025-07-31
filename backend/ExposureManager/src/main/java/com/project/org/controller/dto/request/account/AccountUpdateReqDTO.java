package com.project.org.controller.dto.request.account;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AccountUpdateReqDTO {
    @NotNull
    private Long id;
    @NotBlank
    private String name;
    @NotNull
    private Long portfolioId;
}