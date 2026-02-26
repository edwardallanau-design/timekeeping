# Security Guidelines

## Secrets Management

### Never Commit Secrets

**❌ NEVER:**
- Hardcode API keys, passwords, or tokens in source code
- Commit `.env` files with real secrets
- Use example secrets as actual values

**✅ DO:**
- Use environment variables for all secrets
- Keep `.env` files in `.gitignore` (already configured)
- Use `.env.example` for templates with placeholder values
- Generate strong secrets for production

### Environment Variables

All secrets are loaded from environment variables with fallback placeholders:

```bash
# Never has a real default — must be set via env var
jwt.secret=${JWT_SECRET:CHANGE_ME_IN_PRODUCTION_USE_ENV_VARIABLE}

# All database credentials from env
spring.datasource.url=${DATABASE_URL:...}
spring.datasource.username=${DATABASE_USERNAME:...}
spring.datasource.password=${DATABASE_PASSWORD:...}
```

### Setting Up for Development

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your local values:
   ```bash
   DB_PASSWORD=your_local_password
   JWT_SECRET=any-64-char-string-for-local-dev
   ```

3. Never commit `.env`:
   ```bash
   # Already in .gitignore, but verify:
   git status  # Should NOT show .env
   ```

### Setting Up for Production

1. Generate a strong JWT_SECRET:
   ```bash
   # On Linux/macOS:
   openssl rand -base64 48

   # Output example: UQXy3K/pX8... (64+ characters)
   ```

2. Use a secrets management tool:
   - **Docker**: Environment variables in docker-compose.yml (from .env file)
   - **Kubernetes**: Secrets manifests
   - **Cloud platforms**: AWS Secrets Manager, Azure Key Vault, Google Secret Manager
   - **CI/CD**: GitHub Secrets, GitLab Variables, etc.

3. Never use production secrets in development

## Git Security

### .gitignore Configuration

All sensitive files are ignored:

```
.env              # All environment files
.env.local        # Local overrides
.env.*.local      # Environment-specific
*.key, *.pem      # Private keys
*.secret          # Secrets files
```

### Pre-commit Checks

Before committing, verify no secrets are included:

```bash
# Check for accidental secret patterns
git diff --cached | grep -E "secret|password|key|token"

# List files being committed
git status --short

# Verify .env is NOT in the list
```

## Docker Security

### Multi-stage Builds

- **Build stage** runs as root (needed for compilation)
- **Runtime stage** uses non-root user `appuser`
- Secrets never baked into image layers

### Environment at Runtime

Secrets passed at container start:
```bash
docker run \
  -e JWT_SECRET="..." \
  -e DATABASE_PASSWORD="..." \
  my-app:latest
```

Or via docker-compose:
```yaml
backend:
  environment:
    JWT_SECRET: ${JWT_SECRET}
    DATABASE_PASSWORD: ${DATABASE_PASSWORD}
```

## Authentication & Passwords

### Password Hashing

- Passwords hashed with **BCrypt** (10 rounds)
- Never stored in plaintext
- Never logged or printed

### JWT Tokens

- Signed with HS512 algorithm
- Secret key must be 64+ characters
- Tokens expire after configured time (default: 30 days)
- Revocation not possible (short expiry mitigates)

### Token Storage (Frontend)

- Stored in `localStorage` (accessible to XSS attacks)
- Alternative: httpOnly cookies (prevents XSS but vulnerable to CSRF)
- Current approach: Bearer token with CSRF protection via SameSite cookies

## Code Review Checklist

Before merging PRs, verify:

- [ ] No hardcoded secrets in code
- [ ] All credentials use environment variables
- [ ] No `.env` files committed
- [ ] `.gitignore` includes all sensitive files
- [ ] Example `.env` files have placeholders, not real values
- [ ] Passwords are hashed before storage
- [ ] API errors don't leak sensitive info
- [ ] No SQL injection vulnerabilities
- [ ] Input validation on all endpoints

## Incident Response

If a secret is accidentally committed:

1. **Immediately rotate** the compromised secret
2. **Force push** to remove from history (if feasible):
   ```bash
   git reset HEAD~1
   # Remove the secret from files
   git commit --amend -m "Removed secret"
   git push --force-with-lease
   ```
3. **Or use git-filter-repo** to rewrite history:
   ```bash
   # Warning: Destructive; coordinate with team
   git filter-repo --path .env --invert-paths
   ```
4. **Audit logs** to see who/when accessed the secret
5. **Invalidate all tokens** if JWT_SECRET was exposed

## Dependencies Security

Keep dependencies updated:

```bash
# Backend
cd backend
mvn versions:display-dependency-updates

# Frontend
cd frontend
npm outdated
npm update
```

## CORS & Headers

- CORS origins configured per environment (not `*`)
- Security headers set in nginx config
- HTTPS enforced in production

## Further Reading

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [12 Factor App - Config](https://12factor.net/config)
- [Spring Security Docs](https://spring.io/projects/spring-security)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

**Always prioritize security. When in doubt, ask! 🔐**
