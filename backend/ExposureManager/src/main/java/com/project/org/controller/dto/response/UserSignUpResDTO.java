package com.project.org.controller.dto.response;

import com.project.org.persistence.entity.enums.Roles;
import lombok.Data;
import org.springframework.context.support.BeanDefinitionDsl;

@Data
public class UserSignUpResDTO {
    private Long id;
    private String username;
    private Roles role;
}
