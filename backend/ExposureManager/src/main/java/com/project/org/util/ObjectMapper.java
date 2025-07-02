package com.project.org.util;

import com.project.org.controller.dto.request.UserSignUpReqDTO;
import com.project.org.controller.dto.response.UserSignUpResDTO;
import com.project.org.persistence.entity.UserEntity;
import com.project.org.persistence.entity.enums.Roles;

public class ObjectMapper {
    public static UserEntity toEntity(UserSignUpReqDTO userSignUpReqDTO) {
        UserEntity entity = new UserEntity();
        entity.setUsername(userSignUpReqDTO.getUsername());
        entity.setPasswordHash(userSignUpReqDTO.getPassword());
        entity.setRole(Roles.getRoleByText(userSignUpReqDTO.getRoleText()));
        return entity;
    }

    public static UserSignUpResDTO toDTO(UserEntity userEntity) {
        UserSignUpResDTO dto = new UserSignUpResDTO();
        dto.setId(userEntity.getId());
        dto.setUsername(userEntity.getUsername());
        dto.setRole(userEntity.getRole());
        return dto;
    }
}
