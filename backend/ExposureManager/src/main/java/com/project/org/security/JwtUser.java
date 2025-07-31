package com.project.org.security;

import com.project.org.persistence.entity.enums.Role;
import lombok.Data;

@Data
public class JwtUser {
    private Long id;
    private String username;
    private Role role;
}
