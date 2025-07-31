package com.project.org.controller.dto.request.database;

import com.project.org.persistence.entity.enums.Role;
import lombok.Data;

import java.util.Set;

@Data
public class DatabaseUpdateReqDTO {
    private String oldName;
    private String newName;
    private Set<Role> allowedRoles;
}
