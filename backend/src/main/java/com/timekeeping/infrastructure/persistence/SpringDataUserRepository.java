package com.timekeeping.infrastructure.persistence;

import com.timekeeping.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Spring Data JPA interface — internal to the infrastructure layer.
 * Not exposed to the application or domain layers.
 */
interface SpringDataUserRepository extends JpaRepository<User, String> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
}
