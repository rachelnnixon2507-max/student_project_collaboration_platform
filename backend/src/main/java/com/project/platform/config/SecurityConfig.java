package com.project.platform.config;

import com.project.platform.security.CustomUserDetailsService;
import com.project.platform.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
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

import java.util.List;

/**
 * Shared security configuration (JWT-based, stateless).
 * Provides role-based access control, CORS configuration, and BCrypt encryption.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CustomUserDetailsService userDetailsService;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return new ProviderManager(provider);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .headers(headers -> headers.frameOptions(frame -> frame.disable()))
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/h2-console/**").permitAll()
                .requestMatchers("/api/files/download/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/projects/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/tasks/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/teams/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/files/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/messages/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/announcements/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/faculty/**").permitAll()
                // Admin & System module — ADMIN only, except where noted
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/announcements/**").authenticated()
                .requestMatchers("/api/analytics/**").hasRole("ADMIN")
                .requestMatchers("/api/reviews/**").authenticated()
                // Team Collaboration, Projects, Students, Notifications & shared routes
                .requestMatchers("/api/tasks/**").authenticated()
                .requestMatchers("/api/projects/**").authenticated()
                .requestMatchers("/api/teams/**").authenticated()
                .requestMatchers("/api/messages/**").authenticated()
                .requestMatchers("/api/files/**").authenticated()
                .requestMatchers("/api/students/**").authenticated()
                .requestMatchers("/api/faculty/**").authenticated()
                .requestMatchers("/api/notifications/**").authenticated()
                // Everything else: require authentication by default
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
