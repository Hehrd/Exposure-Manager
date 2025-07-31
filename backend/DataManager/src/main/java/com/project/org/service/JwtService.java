package com.project.org.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Map;

@Service
public class JwtService {
    private final JwtParser jwtParser;

    @Autowired
    public JwtService(JwtParser jwtParser) {
        this.jwtParser = jwtParser;
    }

    public Long extractUserId(String jwt) {
        Claims claims = jwtParser.parseSignedClaims(jwt).getPayload();
        Map<String, Object> userMap = (Map<String, Object>) claims.get("user");
        return Integer.toUnsignedLong((Integer) userMap.get("id"));
    }

}
