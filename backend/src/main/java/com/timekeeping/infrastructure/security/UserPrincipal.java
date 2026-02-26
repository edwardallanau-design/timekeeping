package com.timekeeping.infrastructure.security;

import com.timekeeping.domain.user.Role;
import com.timekeeping.domain.user.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/**
 * Spring Security {@link UserDetails} wrapper around the domain {@link User}.
 * Keeps the domain entity free of Spring Security dependencies.
 */
public class UserPrincipal implements UserDetails {

    private final String id;
    private final String email;
    private final String password;
    private final Role role;

    public UserPrincipal(User user) {
        this.id       = user.getId();
        this.email    = user.getEmail();
        this.password = user.getPassword();
        this.role     = user.getRole();
    }

    public String getId() {
        return id;
    }

    @Override public String getUsername()                                     { return email; }
    @Override public String getPassword()                                     { return password; }
    @Override public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }
    @Override public boolean isAccountNonExpired()                            { return true; }
    @Override public boolean isAccountNonLocked()                             { return true; }
    @Override public boolean isCredentialsNonExpired()                        { return true; }
    @Override public boolean isEnabled()                                      { return true; }
}
