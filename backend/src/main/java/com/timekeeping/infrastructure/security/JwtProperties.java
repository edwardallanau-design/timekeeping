package com.timekeeping.infrastructure.security;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Binds jwt.* properties from application.properties.
 * Centralises JWT configuration in one typed, injectable object.
 */
@Component
@ConfigurationProperties(prefix = "jwt")
public class JwtProperties {

    private String secret;
    private long expiration;

    public String getSecret()          { return secret; }
    public void setSecret(String s)    { this.secret = s; }

    public long getExpiration()        { return expiration; }
    public void setExpiration(long e)  { this.expiration = e; }
}
