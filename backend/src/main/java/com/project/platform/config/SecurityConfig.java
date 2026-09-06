package com.project.platform.config;

import com.project.platform.security.CustomUserDetailsService;
import com.project.platform.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
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
 *
 * NOTE FOR TEAM: This is shared infrastructure. If another member already
 * has a SecurityConfig, do NOT create a second one — merge the rule sets
 * below into the existing config instead (see Team Rule #22: shared-class
 * changes must be explained before implementing).
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
        // BCrypt per team tech stack (Team Rule: use BCrypt for password hashing)
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .httpBasic(httpBasic -> httpBasic.disable())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .headers(headers -> headers.frameOptions(frame -> frame.disable()))
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/h2-console/**").permitAll()
                .requestMatchers("/api/files/download/**").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/projects/**").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/tasks/**").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/teams/**").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/files/**").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/messages/**").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/announcements/**").permitAll()
                // Admin & System module (Member 4) — ADMIN only, except where noted
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/announcements/**").authenticated() // create=ADMIN enforced via @PreAuthorize, read=any authenticated user
                .requestMatchers("/api/analytics/**").hasRole("ADMIN")
                .requestMatchers("/api/reviews/**").authenticated() // STUDENT/FACULTY/ADMIN, enforced via @PreAuthorize per-endpoint
                // Team Collaboration module (Member 2)
                .requestMatchers("/api/tasks/**").authenticated()
                .requestMatchers("/api/projects/**").authenticated()
                .requestMatchers("/api/teams/**").authenticated()
                .requestMatchers("/api/messages/**").authenticated()
                .requestMatchers("/api/files/**").authenticated()
                // Everything else: require authentication by default
                .anyRequest().authenticated()
            )
            .authenticationProvider(authenticationProvider())
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
