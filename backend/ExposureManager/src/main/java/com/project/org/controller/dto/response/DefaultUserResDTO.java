package com.project.org.controller.dto.response;

import com.project.org.persistence.entity.enums.Role;
import lombok.Data;

@Data
public class DefaultUserResDTO implements ResDTO{
    private Long id;
    private String username;
    private Role role;
}
