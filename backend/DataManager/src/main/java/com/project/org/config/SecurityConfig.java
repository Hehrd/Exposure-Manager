package com.project.org.config;

import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.jackson.io.JacksonDeserializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

@Configuration
public class SecurityConfig {

    @Bean
    public JwtParser jwtParser(@Value("${jwt.secret}") String secret) {
        SecretKey jwtSecretKey = new SecretKeySpec(secret.getBytes(), "HMACSHA256");;
        return Jwts.parser()
                .verifyWith(jwtSecretKey)
                .json(new JacksonDeserializer<>())
                .build();
    }
}
