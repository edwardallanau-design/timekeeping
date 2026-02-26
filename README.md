# Timekeeping System

Production-grade timekeeping application with event-driven architecture, clean layering, and SOLID principles.

## Tech Stack

| Component | Version | Details |
|-----------|---------|---------|
| **Java Backend** | Java 25 + Spring Boot 4.0.3 | PostgreSQL + Flyway migrations |
| **Frontend** | React 19 + Vite 6 | react-router-dom v7, lucide-react |
| **Database** | PostgreSQL 16 | Managed by Flyway |
| **Container** | Docker + Docker Compose | Multi-stage builds, non-root user |

## Key Features

✅ **Secure Authentication** — JWT-based with Spring Security
✅ **Time Tracking** — Clock in/out with automatic hour calculation
✅ **Event-Driven** — Domain events published for audit logging, extensible to notifications/webhooks
✅ **Clean Architecture** — Domain → Application → Infrastructure → Presentation layers
✅ **SOLID Principles** — Single responsibility, Open/Closed, Liskov substitution, Interface segregation, Dependency inversion
✅ **Production-Grade** — GlobalExceptionHandler, validation, async event handling, proper error responses
✅ **Deployable** — Docker Compose setup with postgres, backend, frontend

## Project Structure

```
timekeeping/
├── backend/                         # Java 25 + Spring Boot
│   ├── src/main/java/com/timekeeping/
│   │   ├── domain/                  # Entities, interfaces, domain events
│   │   │   ├── user/
│   │   │   └── timelog/
│   │   ├── application/             # Use-case services, commands, results, event handlers
│   │   │   ├── auth/
│   │   │   ├── timelog/
│   │   │   └── event/
│   │   ├── infrastructure/          # Spring Data adapters, JWT, security
│   │   │   ├── persistence/
│   │   │   └── security/
│   │   ├── presentation/            # REST controllers, HTTP DTOs
│   │   │   ├── auth/
│   │   │   ├── timelog/
│   │   │   └── health/
│   │   ├── config/                  # SecurityConfig, AsyncConfig
│   │   ├── shared/                  # Exception hierarchy, GlobalExceptionHandler
│   │   └── TimekeepingApplication.java
│   ├── src/main/resources/
│   │   ├── db/migration/            # Flyway SQL migrations
│   │   ├── application.properties    # Main config
│   │   └── application-docker.properties
│   ├── pom.xml                      # Maven: Spring Boot 4.0.3, Flyway, Actuator
│   └── Dockerfile                   # Multi-stage: jdk-alpine → jre-alpine
│
├── frontend/                        # React 19 + Vite
│   ├── src/
│   │   ├── pages/                   # Login, Register, Dashboard
│   │   ├── components/              # Timesheet, AttendanceCalendar, AnalogClock
│   │   ├── context/                 # AuthContext
│   │   ├── services/                # API client (axios)
│   │   ├── styles/                  # CSS modules
│   │   └── App.jsx, index.jsx
│   ├── package.json                 # React 19, vite 6, react-router-dom v7
│   ├── vite.config.js
│   ├── nginx.conf                   # SPA routing + /api proxy
│   └── Dockerfile                   # node:22-alpine → nginx:stable-alpine
│
├── docker-compose.yml               # postgres + backend + frontend
├── .env.example                     # Config template
├── README.md                        # This file
└── SETUP.md                         # Detailed setup & what changed
```

## Quick Start

### Option 1: Docker Compose (Recommended)

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Update .env with your JWT_SECRET and DB_PASSWORD
# 3. Build and run
docker compose up --build

# Services:
#   Frontend:  http://localhost
#   Backend:   http://localhost:5000
#   Health:    http://localhost:5000/actuator/health
```

### Option 2: Local Development

**Backend:**
```bash
cd backend
mvn clean spring-boot:run
```
Runs on http://localhost:5000

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```
Runs on http://localhost:3000 (proxies `/api` to backend)

## API Endpoints

### Authentication
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login |
| GET | `/api/auth/me` | Bearer | Current user info |

### Time Logs
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/api/timelog/time-in` | Bearer | Clock in |
| POST | `/api/timelog/time-out` | Bearer | Clock out |
| GET | `/api/timelog/daily?date=2024-01-15` | Bearer | Daily log |
| GET | `/api/timelog/monthly?year=2024&month=1` | Bearer | Monthly logs |
| GET | `/api/timelog/yearly?year=2024` | Bearer | Yearly statistics |

### System
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/health` | — | Liveness probe |
| GET | `/actuator/health` | — | Spring Boot health |

## Attendance Status

Status is calculated based on hours worked:

| Status | Condition |
|--------|-----------|
| `PRESENT` | ≥ 8 hours |
| `HALF_DAY` | > 4 and < 8 hours |
| `ABSENT` | ≤ 4 hours |

## Event-Driven Architecture

Domain events trigger side-effects without coupling services:

```
User Registration
  └─ UserRegisteredEvent → AuditEventHandler [async]
     └─ Logs: "User registered: {email}"

Time Clock-In
  └─ TimeInRecordedEvent → AuditEventHandler [async]
     └─ Logs: "Time-in recorded: {userId} at {time}"

Time Clock-Out
  └─ TimeOutRecordedEvent → AuditEventHandler [async]
     └─ Logs: "Time-out recorded: {userId} | {hours}h | {status}"
```

To add email notifications, webhooks, or analytics — create a new `@EventListener` class. Services remain unchanged (Open/Closed principle).

## SOLID Principles in Action

- **Single Responsibility**: `JwtTokenProvider` only handles JWT; `AuditEventHandler` only logs
- **Open/Closed**: New event handlers = new class; existing services untouched
- **Liskov Substitution**: Repository adapters fully implement domain interfaces
- **Interface Segregation**: `AuthService` and `TimeLogService` are focused, separate
- **Dependency Inversion**: Services depend on domain `UserRepository` interface, not JPA directly

## Configuration

### Environment Variables (see `.env.example`)

| Variable | Purpose |
|----------|---------|
| `DB_USER` | PostgreSQL username |
| `DB_PASSWORD` | PostgreSQL password |
| `JWT_SECRET` | JWT signing secret (generate a strong 64+ char value) |
| `JWT_EXPIRATION` | Token TTL in milliseconds |
| `BACKEND_PORT` | Backend port (default: 5000) |
| `FRONTEND_PORT` | Frontend port (default: 80) |

### Spring Boot Profiles

- `application.properties` — Local development (connects to `localhost:5432`)
- `application-docker.properties` — Docker environment (connects to `postgres:5432` service)

Set `SPRING_PROFILES_ACTIVE=docker` in docker-compose.yml to use the docker profile.

## Database Migrations

[Flyway](https://flywaydb.org) manages schema evolution:

```sql
-- backend/src/main/resources/db/migration/V1__create_schema.sql
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    department VARCHAR(100) DEFAULT 'General',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE time_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id),
    date DATE NOT NULL,
    time_in TIMESTAMP,
    time_out TIMESTAMP,
    hours_worked NUMERIC(5, 2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'PRESENT',
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT uq_user_date UNIQUE (user_id, date)
);
```

To add new migrations, create `V2__<description>.sql` in the same directory. Flyway applies them automatically on startup.

## Frontend Highlights

- **React 19** — Automatic JSX transform, no explicit `React` imports
- **Vite 6** — Lightning-fast dev server
- **react-router-dom v7** — Modern routing
- **Lucide Icons** — Clean, lightweight SVG icons
- **Axios** — Type-safe HTTP client
- **AuthContext** — Global auth state with localStorage persistence

## Security

- ✅ JWT tokens with HS512 signing
- ✅ BCrypt password hashing
- ✅ CORS configured per environment
- ✅ Spring Security request filtering
- ✅ Bean validation on all DTOs
- ✅ GlobalExceptionHandler prevents error leakage
- ✅ Non-root Docker user

## Troubleshooting

### Backend

**Port 5000 already in use:**
```bash
# Find process on port 5000
lsof -i :5000
# Kill it or change BACKEND_PORT in .env
```

**Database connection error:**
- Verify PostgreSQL is running: `docker compose logs postgres`
- Check DB credentials in `.env`
- Ensure `DATABASE_URL` matches your environment

### Frontend

**Hot reload not working:**
```bash
npm cache clean --force
rm -rf node_modules && npm install
npm run dev
```

**CORS errors:**
- Check `CORS_ALLOWED_ORIGINS` in `application.properties`
- Ensure backend is accessible from frontend URL

## Development Workflow

1. Make changes to backend Java files
2. Spring Boot automatically recompiles (devtools enabled)
3. Make changes to frontend React files
4. Vite hot-reloads automatically
5. Commit changes and create PR with description

## Performance Notes

- ✅ Spring Boot virtual threads enabled (Java 21+ feature)
- ✅ Event handlers run async (no request blocking)
- ✅ Connection pooling with HikariCP
- ✅ Nginx caches static assets with 1-year expiry
- ✅ Docker multi-stage builds keep images lean

## Future Enhancements

- [ ] Email notifications on registration
- [ ] Overtime tracking and alerts
- [ ] Leave management module
- [ ] Admin dashboard with analytics
- [ ] PDF report exports
- [ ] Mobile app (React Native)
- [ ] Team management
- [ ] Department hierarchies
- [ ] Webhook integrations
- [ ] SAML/OAuth integrations

## References

- [SETUP.md](./SETUP.md) — Detailed setup and migration guide
- [Backend README](./backend/README.md) — Java-specific documentation
- [Spring Boot 4.0 Docs](https://spring.io/projects/spring-boot)
- [React 19 Docs](https://react.dev)
- [Flyway Migration Guide](https://flywaydb.org/documentation/getstarted/)
- [Docker Compose Docs](https://docs.docker.com/compose/)

## License

ISC

---

**Happy Timekeeping! 🚀**
