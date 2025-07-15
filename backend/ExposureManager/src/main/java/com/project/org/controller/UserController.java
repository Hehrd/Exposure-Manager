package com.project.org.controller;

import com.project.org.controller.dto.request.user.UserLoginReqDTO;
import com.project.org.controller.dto.request.user.UserSignUpReqDTO;
import com.project.org.controller.dto.response.DefaultUserResDTO;
import com.project.org.error.exception.NotFoundException;
import com.project.org.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
public class UserController {
    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping(value = "/signup", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<DefaultUserResDTO> signUp(@RequestBody UserSignUpReqDTO userSignUpReqDTO) {
        DefaultUserResDTO resDTO = userService.signUp(userSignUpReqDTO);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(resDTO);
    }

    @PostMapping(value = "/login", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> login(@RequestBody UserLoginReqDTO userLoginReqDTO) {
        String jwt = userService.login(userLoginReqDTO);
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.SET_COOKIE, createJwtCookie(jwt).toString());
        return ResponseEntity
                .status(HttpStatus.OK)
                .headers(headers)
                .body("Login successful!");
    }



    @GetMapping(value = "/me")
    public ResponseEntity<DefaultUserResDTO> me(@CookieValue("access_token") String token) throws NotFoundException {
        DefaultUserResDTO resDTO = userService.me(token);
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(resDTO);
    }

    @PostMapping(value = "/hello")
    public ResponseEntity<String> ohio(HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body("Hello World!");
    }

    private ResponseCookie createJwtCookie(String jwt) {
        ResponseCookie jwtCookie = ResponseCookie.from("access_token", jwt)
                .httpOnly(true)
                .path("/")
                .maxAge(7 * 24 * 60 * 60)
                .build();
        return jwtCookie;
    }
}

