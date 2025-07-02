package com.project.org.controller.dto.request;

import com.project.org.persistence.entity.enums.Roles;
import lombok.Data;

@Data
public class UserSignUpReqDTO {
    private String username;
    private String password;
    private String roleText;
}
