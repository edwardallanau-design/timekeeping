# Backend Update: Java 25, Spring Boot 3.4.3, Maven 3.9.9

## Overview

The Timekeeping application now exclusively uses **Java 25 with Spring Boot 3.4.3 and Maven 3.9.9** for the backend.

**Node.js backend has been completely removed.**

## Key Changes

### Technology Stack Updates
- **Java Version**: Upgraded from 17 → **Java 25**
- **Spring Boot**: Upgraded from 3.2.0 → **3.4.3**
- **Maven**: Updated to **3.9.9**
- **jjwt**: Updated to **0.13.0**

### Backend Structure
- Single backend implementation: **Java/Spring Boot**
- No more Node.js/Express option
- All API endpoints remain identical

## Prerequisites

### Minimum Requirements
- Java 25 (JDK 25 or higher)
- Maven 3.9.9 or higher
- MongoDB 4.0+

### Installation

#### 1. Install Java 25
```bash
# macOS (using Homebrew)
brew install openjdk@25

# Or download from https://jdk.java.net/25/
```

#### 2. Install Maven 3.9.9
```bash
# macOS
brew install maven

# Verify installation
mvn --version  # Should show 3.9.9
```

#### 3. Verify Java Installation
```bash
java -version   # Should show Java 25.x
javac -version  # Should match
```

## Running the Backend

```bash
# Navigate to backend
cd backend-java

# Configure environment
cp .env.example .env

# Build and run
mvn clean install
mvn spring-boot:run
```

The server will start on **http://localhost:5000**

## API Endpoints

All endpoints remain unchanged from the previous version:

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (requires JWT)

### Time Logs
- `POST /api/timelog/time-in` - Record time in (requires JWT)
- `POST /api/timelog/time-out` - Record time out (requires JWT)
- `GET /api/timelog/daily?date=YYYY-MM-DD` - Get daily log (requires JWT)
- `GET /api/timelog/monthly?year=YYYY&month=MM` - Get monthly attendance (requires JWT)
- `GET /api/timelog/yearly?year=YYYY` - Get yearly stats (requires JWT)

### Health
- `GET /api/health` - Health check

## Configuration

### Environment Variables
```
MONGODB_URI=mongodb://localhost:27017/timekeeping
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRATION=2592000000
```

### MongoDB
- Still uses the same MongoDB database
- No migration needed - database schema is compatible
- Connection string format unchanged
