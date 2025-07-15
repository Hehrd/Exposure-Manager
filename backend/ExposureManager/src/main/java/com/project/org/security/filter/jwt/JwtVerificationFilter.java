package com.project.org.security.filter.jwt;

import com.project.org.persistence.repository.UserRepository;
import com.project.org.service.CustomUserDetailsService;
import com.project.org.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.List;

@Component
public class JwtVerificationFilter extends JwtFilter {
    private final CustomUserDetailsService userDetailsService;

    @Autowired
    public JwtVerificationFilter(JwtService jwtService,
                                 AuthenticationManager authenticationManager,
                                 CustomUserDetailsService userDetailsService) {
        super(jwtService, authenticationManager);
        this.userDetailsService = userDetailsService;
    }

    @Override
    public void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        if (isUrlPublic(request.getRequestURI())) {
            filterChain.doFilter(request, response);
            return;
        }
        String token = getTokenFromRequest(request);
        if (token != null && !jwtService.isExpired(token)) {
            createAuth(token);
            filterChain.doFilter(request, response);
            return;
        }

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.getWriter().write("Missing or invalid JWT token");
    }

    private void createAuth(String token) {
        String username = jwtService.extractUsername(token);
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        if (userDetails != null && username.equals(userDetails.getUsername())) {
            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(auth);
        }
    }


}
