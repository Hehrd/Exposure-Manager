package com.project.org.controller.dto.request.user;

import com.project.org.persistence.entity.enums.Role;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UserSignUpReqDTO {
    @NotNull
    private String username;
    @NotNull
    private String password;
    @NotNull
    private Role role;
}
