package com.project.org.controller.dto.request.database;

import com.project.org.persistence.entity.enums.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.Set;

@Data
public class DatabaseCreateReqDTO {
    @NotBlank
    private String name;

    @NotNull
    private Set<Role> allowedRoles;
}
