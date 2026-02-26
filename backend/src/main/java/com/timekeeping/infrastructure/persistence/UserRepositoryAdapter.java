package com.timekeeping.infrastructure.persistence;

import com.timekeeping.domain.user.User;
import com.timekeeping.domain.user.UserRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Adapter that bridges the domain {@link UserRepository} interface
 * to Spring Data JPA. Application services depend only on the domain
 * interface — this class is invisible above the infrastructure layer.
 */
@Repository
class UserRepositoryAdapter implements UserRepository {

    private final SpringDataUserRepository jpa;

    UserRepositoryAdapter(SpringDataUserRepository jpa) {
        this.jpa = jpa;
    }

    @Override
    public User save(User user) {
        return jpa.save(user);
    }

    @Override
    public Optional<User> findById(String id) {
        return jpa.findById(id);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return jpa.findByEmail(email);
    }

    @Override
    public boolean existsByEmail(String email) {
        return jpa.existsByEmail(email);
    }

    @Override
    public long count() {
        return jpa.count();
    }
}
