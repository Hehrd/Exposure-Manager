package com.project.org.service;

import com.project.org.controller.dto.request.user.UserLoginReqDTO;
import com.project.org.controller.dto.request.user.UserSignUpReqDTO;
import com.project.org.controller.dto.response.DefaultUserResDTO;
import com.project.org.persistence.entity.UserEntity;
import com.project.org.persistence.repository.UserRepository;
import com.project.org.security.CustomUserDetails;
import com.project.org.security.JwtUser;
import com.project.org.util.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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
        return jwtService.createToken(ObjectMapper.toJwtUser(userDetails));
    }

    public JwtUser me(String jwt) {
        JwtUser jwtUser = jwtService.extractUser(jwt);
        return jwtUser;
    }



}
