package com.timekeeping.domain.user;

import java.util.Optional;

/**
 * Domain repository interface for User persistence.
 * Infrastructure adapters implement this contract — application
 * services depend only on this abstraction (Dependency Inversion).
 */
public interface UserRepository {

    User save(User user);

    Optional<User> findById(String id);

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
}
