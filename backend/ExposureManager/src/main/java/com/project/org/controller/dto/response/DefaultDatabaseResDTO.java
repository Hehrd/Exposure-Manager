package com.project.org.controller.dto.response;

import lombok.Data;

@Data
public class DefaultDatabaseResDTO implements ResDTO{
    private Long id;
    private String name;
    private String ownerName;
}
