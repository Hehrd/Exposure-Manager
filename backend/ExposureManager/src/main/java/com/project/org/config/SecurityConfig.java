package com.project.org.config;

import com.project.org.security.JwtUser;
import com.project.org.security.filter.jwt.JwtVerificationFilter;
import com.project.org.service.CustomUserDetailsService;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Deserializer;
import io.jsonwebtoken.jackson.io.JacksonDeserializer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.util.List;
import java.util.Map;

@EnableWebSecurity
@Configuration
public class SecurityConfig {
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http,
                                                   JwtVerificationFilter jwtVerificationFilter,
//                                                   DatabaseRolesFilter databaseRolesFilter,
                                                   CorsConfigurationSource corsConfigurationSource,
                                                   AuthenticationProvider authProvider) throws Exception {
        http.csrf(customizer -> customizer.disable())
                .cors(customizer -> customizer.configurationSource(corsConfigurationSource))
                .authorizeHttpRequests(request ->
                        request.requestMatchers("/login", "/signup").permitAll()
                                .anyRequest().authenticated())
                .authenticationProvider(authProvider)
                .sessionManagement(customizer -> customizer.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterAfter(jwtVerificationFilter, UsernamePasswordAuthenticationFilter.class);
//                .addFilterAfter(databaseRolesFilter, JwtVerificationFilter.class);
        return http.build();
    }

    @Bean
    @Primary
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration frontendConfig = new CorsConfiguration();
        frontendConfig.setAllowedOrigins(List.of("http://localhost:5173"));
        frontendConfig.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        frontendConfig.setAllowedHeaders(List.of("*"));
        frontendConfig.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", frontendConfig);
        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public AuthenticationProvider authenticationProvider(CustomUserDetailsService userDetailsService,
                                                       PasswordEncoder passwordEncoder) throws Exception {
        DaoAuthenticationProvider daoAuthenticationProvider = new DaoAuthenticationProvider(userDetailsService);
        daoAuthenticationProvider.setPasswordEncoder(passwordEncoder);
        return daoAuthenticationProvider;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecretKey jwtSecretKey(@Value("${jwt.secret}") String secret) {
        return new SecretKeySpec(secret.getBytes(), "HMACSHA256");
    }

    @Bean
    public JwtParser jwtParser(SecretKey jwtSecretKey) {
        return Jwts.parser()
                .verifyWith(jwtSecretKey)
                .json(new JacksonDeserializer<>())
                .build();
    }
}
