package com.project.platform.repository;

import com.project.platform.entity.User;
import com.project.platform.entity.enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByInstitutionalId(String institutionalId);

    @Query("SELECT u FROM User u WHERE LOWER(u.email) = LOWER(:identifier) OR UPPER(u.institutionalId) = UPPER(:identifier)")
    Optional<User> findByEmailOrInstitutionalId(@Param("identifier") String identifier);

    Page<User> findByRole(Role role, Pageable pageable);
    java.util.List<User> findByRole(Role role);
    long countByRole(Role role);
    boolean existsByRole(Role role);
    boolean existsByEmail(String email);
    boolean existsByInstitutionalId(String institutionalId);
}

