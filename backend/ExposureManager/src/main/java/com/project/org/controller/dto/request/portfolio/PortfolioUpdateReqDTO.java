package com.project.org.controller.dto.request.portfolio;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PortfolioUpdateReqDTO {
    @NotNull
    private Long id;
    @NotBlank
    private String name;
}
