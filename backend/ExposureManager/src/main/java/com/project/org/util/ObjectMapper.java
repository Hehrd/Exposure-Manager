package com.project.org.util;

import com.project.org.controller.dto.request.database.DatabaseCreateReqDTO;
import com.project.org.controller.dto.request.job.JobCreateReqDTO;
import com.project.org.controller.dto.request.user.UserSignUpReqDTO;
import com.project.org.controller.dto.response.DefaultDatabaseResDTO;
import com.project.org.controller.dto.response.DefaultJobResDTO;
import com.project.org.controller.dto.response.DefaultUserResDTO;
import com.project.org.persistence.entity.DatabaseEntity;
import com.project.org.persistence.entity.JobEntity;
import com.project.org.persistence.entity.UserEntity;
import com.project.org.security.CustomUserDetails;
import com.project.org.security.JwtUser;

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
        entity.setName(databaseCreateReqDTO.getName().toLowerCase());
        return entity;
    }

    public static JobEntity toEntity(JobCreateReqDTO jobCreateReqDTO) {
        JobEntity entity = new JobEntity();
        entity.setName(jobCreateReqDTO.getName());
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

    public static DefaultJobResDTO toDTO(JobEntity jobEntity) {
        DefaultJobResDTO dto = new DefaultJobResDTO();
        dto.setId(jobEntity.getId());
        dto.setName(jobEntity.getName());
        dto.setTimeStartedMillis(jobEntity.getTimeStartedMillis());
        dto.setTimeFinishedMillis(jobEntity.getTimeFinishedMillis());
        dto.setStatus(jobEntity.getStatus());
        return dto;
    }


    public static JwtUser toJwtUser(CustomUserDetails customUserDetails) {
        JwtUser jwtUser = new JwtUser();
        jwtUser.setId(customUserDetails.getId());
        jwtUser.setUsername(customUserDetails.getUsername());
        jwtUser.setRole(customUserDetails.getRole());
        return jwtUser;
    }
}
