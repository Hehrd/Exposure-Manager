package com.project.org.service;

import com.project.org.controller.dto.request.user.UserLoginReqDTO;
import com.project.org.controller.dto.request.user.UserSignUpReqDTO;
import com.project.org.controller.dto.response.DefaultUserResDTO;
import com.project.org.error.exception.NotFoundException;
import com.project.org.persistence.entity.UserEntity;
import com.project.org.persistence.repository.UserRepository;
import com.project.org.security.CustomUserDetails;
import com.project.org.util.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Autowired
    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    public DefaultUserResDTO signUp(UserSignUpReqDTO reqDTO) {
        reqDTO.setPassword(passwordEncoder.encode(reqDTO.getPassword()));
        UserEntity userEntity = ObjectMapper.toEntity(reqDTO);
        userRepository.save(userEntity);
        return ObjectMapper.toDTO(userEntity);
    }

    public String login(UserLoginReqDTO reqDTO) {
        Authentication auth = authenticationManager
                .authenticate(new UsernamePasswordAuthenticationToken(reqDTO.getUsername(), reqDTO.getPassword()));
        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
        return jwtService.createToken(userDetails.getUsername());
    }

    public DefaultUserResDTO me(String token) throws NotFoundException {
        String jwtUsername = jwtService.extractUsername(token);
        Optional<UserEntity> userEntityOptional = userRepository.findByUsername(jwtUsername);
        UserEntity userEntity = userEntityOptional.orElseThrow(
                () -> new NotFoundException(String.format("User with username %s not found!", jwtUsername)));
        return ObjectMapper.toDTO(userEntity);
    }



}
