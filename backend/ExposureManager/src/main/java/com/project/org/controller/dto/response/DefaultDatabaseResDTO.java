package com.project.org.controller.dto.response;

import com.project.org.persistence.entity.enums.Role;
import lombok.Data;

import java.util.Set;

@Data
public class DefaultDatabaseResDTO implements ResDTO{
    private Long id;
    private String name;
    private String ownerName;
    private Set<Role> allowedRoles;
}
