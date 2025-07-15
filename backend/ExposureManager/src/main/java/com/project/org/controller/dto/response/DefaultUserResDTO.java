package com.project.org.controller.dto.response;

import com.project.org.persistence.entity.enums.Roles;
import lombok.Data;

@Data
public class DefaultUserResDTO {
    private Long id;
    private String username;
    private Roles role;
}
