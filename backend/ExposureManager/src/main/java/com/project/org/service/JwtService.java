package com.project.org.service;

import com.project.org.persistence.entity.enums.Role;
import com.project.org.security.JwtUser;
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
    private final SecretKey SECRET_KEY;
    private final JwtParser jwtParser;

    @Autowired
    public JwtService(SecretKey jwtSecretKey, JwtParser jwtParser) {
        this.SECRET_KEY = jwtSecretKey;
        this.jwtParser = jwtParser;
    }

    public String createToken(JwtUser user) {
        String jwt = Jwts.builder()
                .subject("userToken")
                .claim("user", user)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 7 * 24 * 1000 * 60 * 60))
                .signWith(SECRET_KEY)
                .compact();
        return jwt;
    }

    public JwtUser extractUser(String jwt) {
        Claims claims = jwtParser.parseSignedClaims(jwt).getPayload();
        Map<String, Object> userMap = (Map<String, Object>) claims.get("user");
        return getJwtUserObj(userMap);
    }

    public boolean isExpired(String jwt) {
        return jwtParser.parseSignedClaims(jwt).getPayload().getExpiration().before(new Date());
    }

    private JwtUser getJwtUserObj(Map<String, Object> userMap) {
        JwtUser jwtUser = new JwtUser();
        jwtUser.setId(Integer.toUnsignedLong((Integer) userMap.get("id")));
        jwtUser.setUsername((String) userMap.get("username"));
        jwtUser.setRole(Role.getRoleByText((String) userMap.get("role")));
        return jwtUser;
    }

}
