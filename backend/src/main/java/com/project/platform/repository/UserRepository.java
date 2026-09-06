package com.project.platform.repository;

import com.project.platform.entity.User;
import com.project.platform.entity.enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Page<User> findByRole(Role role, Pageable pageable);
    java.util.List<User> findByRole(Role role);
    long countByRole(Role role);
    boolean existsByRole(Role role);
    boolean existsByEmail(String email);
}

