package com.project.org.service;

import com.project.org.controller.dto.request.UserSignUpReqDTO;
import com.project.org.controller.dto.response.UserSignUpResDTO;
import com.project.org.persistence.entity.UserEntity;
import com.project.org.persistence.repository.UserRepository;
import com.project.org.util.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final UserRepository userRepository;

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserSignUpResDTO signUp(UserSignUpReqDTO userSignUpReqDTO) {
        UserEntity userEntity = ObjectMapper.toEntity(userSignUpReqDTO);
        userRepository.save(userEntity);
        return ObjectMapper.toDTO(userEntity);
    }
}
