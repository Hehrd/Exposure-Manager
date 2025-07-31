package com.project.org.controller.dto.request.user;

import com.project.org.persistence.entity.enums.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UserLoginReqDTO {
    @NotBlank
    private String username;
    @NotBlank
    private String password;
    @NotNull
    private Role role;
}
