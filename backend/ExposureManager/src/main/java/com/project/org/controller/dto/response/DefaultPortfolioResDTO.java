package com.project.org.controller.dto.response;

import lombok.Data;

@Data
public class DefaultPortfolioResDTO implements ResDTO{
    private Long id;
    private String name;
    private String databaseName;
    private Long ownerId;
}
