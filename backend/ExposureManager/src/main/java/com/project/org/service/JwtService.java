package com.project.org.service;

import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.security.Key;
import java.util.Date;

@Service
public class JwtService {
    private final SecretKey SECRET_KEY;
    private final JwtParser jwtParser;

    @Autowired
    public JwtService(SecretKey jwtSecretKey, JwtParser jwtParser) {
        this.SECRET_KEY = jwtSecretKey;
        this.jwtParser = jwtParser;
    }

    public String createToken(String username) {
        String jwt = Jwts.builder()
                .subject(username)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60))
                .signWith(SECRET_KEY)
                .compact();
        return jwt;
    }

    public String extractUsername(String jwt) {
        String username = jwtParser.parseSignedClaims(jwt).getPayload().getSubject();
        return username;
    }

    public boolean isExpired(String jwt) {
        return jwtParser.parseSignedClaims(jwt).getPayload().getExpiration().before(new Date());
    }

}
