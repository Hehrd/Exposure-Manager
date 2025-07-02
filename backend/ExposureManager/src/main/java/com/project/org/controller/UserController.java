package com.project.org.controller;

import com.project.org.controller.dto.request.UserSignUpReqDTO;
import com.project.org.controller.dto.response.UserSignUpResDTO;
import com.project.org.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserController {
    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping(value = "/signup", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<UserSignUpResDTO> signUp(@RequestBody UserSignUpReqDTO userSignUpReqDTO) {
        UserSignUpResDTO resDTO = userService.signUp(userSignUpReqDTO);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(resDTO);
    }
}
