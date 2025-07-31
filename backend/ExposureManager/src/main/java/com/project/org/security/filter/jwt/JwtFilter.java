package com.project.org.security.filter.jwt;

import com.project.org.security.filter.Filter;
import com.project.org.service.JwtService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.web.filter.OncePerRequestFilter;

import java.util.ArrayList;
import java.util.List;

public abstract class JwtFilter extends Filter {
    protected final JwtService jwtService;
    protected final AuthenticationManager authManager;


    protected JwtFilter(JwtService jwtService, AuthenticationManager authManager) {
        this.jwtService = jwtService;
        this.authManager = authManager;
    }

    protected String getTokenFromRequest(HttpServletRequest request) {
        if (request.getCookies() == null) {
            return null;
        }
        for (Cookie cookie : request.getCookies()) {
            if (cookie != null && cookie.getName().equals("access_token")) {
                return cookie.getValue();
            }
        }
        return null;
    }


}
