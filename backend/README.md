# Timekeeping API - Java Spring Boot Backend

This is the Java Spring Boot backend for the Timekeeping application.

## Technology Stack

- **Java 25** - Latest Java LTS version
- **Spring Boot 3.4.3** - Modern web framework
- **Spring Data MongoDB** - Database access layer
- **Spring Security** - Authentication & authorization
- **JWT (jjwt)** - Token-based authentication
- **Maven 3.9.9** - Dependency management

## Prerequisites

- Java 25 or higher
- Maven 3.9.9 or higher
- MongoDB running locally or accessible via URI

## Setup

### 1. Install Dependencies

```bash
mvn clean install
```

### 2. Environment Configuration

Create a `.env` file in the root directory or set the following environment variables:

```
MONGODB_URI=mongodb://localhost:27017/timekeeping
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_EXPIRATION=2592000000
```

### 3. Run the Application

```bash
mvn spring-boot:run
```

The server will start on `http://localhost:5000`

## Project Structure

```
src/main/
├── java/com/timekeeping/api/
│   ├── controller/          # REST Controllers
│   ├── service/             # Business Logic
│   ├── repository/          # Data Access Layer
│   ├── entity/              # MongoDB Documents
│   ├── dto/                 # Data Transfer Objects
│   ├── config/              # Spring Configuration
│   ├── security/            # JWT & Security
│   └── TimekeepingApplication.java
└── resources/
    └── application.properties
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires JWT)

### Time Logs

- `POST /api/timelog/time-in` - Record time in (requires JWT)
- `POST /api/timelog/time-out` - Record time out (requires JWT)
- `GET /api/timelog/daily?date=YYYY-MM-DD` - Get daily log (requires JWT)
- `GET /api/timelog/monthly?year=YYYY&month=MM` - Get monthly attendance (requires JWT)
- `GET /api/timelog/yearly?year=YYYY` - Get yearly stats (requires JWT)

### Health

- `GET /api/health` - Health check

## Technology Stack

- **Framework**: Spring Boot 3.4.3
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Spring Security
- **Build Tool**: Maven 3.9.9
- **Java Version**: Java 25

## Database Models

### User
- id (MongoDB ObjectId)
- name
- email (unique)
- password (hashed with BCrypt)
- department
- createdAt

### TimeLog
- id (MongoDB ObjectId)
- userId
- date
- timeIn
- timeOut
- hoursWorked
- status (present, absent, half-day)
- notes
- createdAt

## Building for Production

```bash
mvn clean package
java -jar target/timekeeping-api-1.0.0.jar
```
