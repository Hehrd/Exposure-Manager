package com.project.org.controller.dto.request.database;

import com.project.org.persistence.entity.enums.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.Set;

@Data
public class DatabaseUpdateReqDTO {
    @NotBlank
    private String oldName;
    @NotBlank
    private String newName;
    @NotNull
    private Set<Role> allowedRoles;
}
