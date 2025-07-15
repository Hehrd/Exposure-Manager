package com.project.org.util;

import com.project.org.controller.dto.request.database.DatabaseCreateReqDTO;
import com.project.org.controller.dto.request.user.UserSignUpReqDTO;
import com.project.org.controller.dto.response.DefaultDatabaseResDTO;
import com.project.org.controller.dto.response.DefaultUserResDTO;
import com.project.org.persistence.entity.DatabaseEntity;
import com.project.org.persistence.entity.UserEntity;
import com.project.org.persistence.entity.enums.Roles;

public class ObjectMapper {
    public static UserEntity toEntity(UserSignUpReqDTO userSignUpReqDTO) {
        UserEntity entity = new UserEntity();
        entity.setUsername(userSignUpReqDTO.getUsername());
        entity.setPasswordHash(userSignUpReqDTO.getPassword());
        entity.setRole(userSignUpReqDTO.getRole());
        return entity;
    }

    public static DatabaseEntity toEntity(DatabaseCreateReqDTO databaseCreateReqDTO) {
        DatabaseEntity entity = new DatabaseEntity();
        entity.setName(databaseCreateReqDTO.getName());
        return entity;
    }

    public static DefaultUserResDTO toDTO(UserEntity userEntity) {
        DefaultUserResDTO dto = new DefaultUserResDTO();
        dto.setId(userEntity.getId());
        dto.setUsername(userEntity.getUsername());
        dto.setRole(userEntity.getRole());
        return dto;
    }
    public static DefaultDatabaseResDTO toDTO(DatabaseEntity databaseEntity) {
        DefaultDatabaseResDTO dto = new DefaultDatabaseResDTO();
        dto.setId(databaseEntity.getId());
        dto.setName(databaseEntity.getName());
        dto.setOwnerName(databaseEntity.getOwner().getUsername());
        return dto;
    }
}
