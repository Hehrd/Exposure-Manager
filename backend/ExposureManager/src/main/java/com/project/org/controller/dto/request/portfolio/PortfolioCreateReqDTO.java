package com.project.org.controller.dto.request.portfolio;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PortfolioCreateReqDTO {
    @NotBlank
    private String name;
}
