package com.project.org.controller.dto.response;

import lombok.Data;

@Data
public class DefaultAccountResDTO implements ResDTO{
    private Long id;
    private String name;
    private Long portfolioId;
}
