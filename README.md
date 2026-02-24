# Timekeeping System

A complete timekeeping system with React frontend and Java Spring Boot backend.

## Backend Stack

**Java 25 + Spring Boot 3.4.3 + Maven 3.9.9**

This project uses a modern Java backend for enhanced performance and scalability.

## Features

- **User Authentication**: Secure login and registration system
- **Time Tracking**: Clock in and clock out functionality
- **Attendance Calendar**: Visual representation of attendance with monthly/yearly views
- **Work Hours Calculation**: Automatic calculation of hours worked
- **Attendance Statistics**: Track working days, hours, and attendance status

## Project Structure

```
timekeeping/
├── backend-java/            # Java/Spring Boot API server
│   ├── src/main/java/com/timekeeping/api/
│   │   ├── controller/      # REST controllers
│   │   ├── service/         # Business logic
│   │   ├── repository/      # Data access
│   │   ├── entity/          # MongoDB documents
│   │   ├── config/          # Spring configuration
│   │   └── security/        # JWT & security
│   ├── pom.xml
│   └── README.md
│
└── frontend/                # React application
```

## Prerequisites

- **Java 25** or higher
- **Maven 3.9.9** or higher
- **MongoDB** (local or Atlas)
- **Node.js** (for frontend development)

## Installation

### Backend Setup

```bash
cd backend-java
cp .env.example .env
mvn clean install
mvn spring-boot:run
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (protected)

### Time Logging
- `POST /api/timelog/time-in` - Clock in (protected)
- `POST /api/timelog/time-out` - Clock out (protected)
- `GET /api/timelog/daily?date=YYYY-MM-DD` - Get daily log (protected)
- `GET /api/timelog/monthly?year=YYYY&month=MM` - Get monthly attendance (protected)
- `GET /api/timelog/yearly?year=YYYY` - Get yearly statistics (protected)

## Usage

1. **Register/Login**: Create an account or login with existing credentials
2. **Clock In**: Click "Time In" button when starting work
3. **Clock Out**: Click "Time Out" button when finishing work
4. **View Calendar**: See attendance history in the calendar view
5. **Track Hours**: View hours worked and attendance status

## Technologies Used

- **Backend**: Java 25, Spring Boot 3.4.3, Spring Data MongoDB, Spring Security, Maven 3.9.9
- **Frontend**: React, Vite, Axios, React Router
- **Database**: MongoDB
- **Authentication**: JWT (jjwt library)

## Security Features

- JWT-based authentication with jjwt
- Password hashing with BCrypt
- Protected API routes with Spring Security
- Input validation
- CORS configuration
- Spring Security middleware

## Environment Variables

Create a `.env` file in `backend-java/` directory:

```
MONGODB_URI=mongodb://localhost:27017/timekeeping
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_EXPIRATION=2592000000
```

## Troubleshooting

### Java Backend Issues
- Ensure Java 25+ is installed: `java -version`
- Ensure Maven 3.9.9+ is installed: `mvn --version`
- Check that port 5000 is available
- Verify MongoDB is running

### Frontend Issues
- Clear npm cache if needed: `npm cache clean --force`
- Reinstall dependencies if needed: `rm -rf node_modules && npm install`

## Future Enhancements

- Email notifications
- Overtime tracking
- Leave management
- Admin dashboard
- Export attendance reports
- Mobile app
- Team management
- Department-wise statistics
- Advanced reporting
- Integration with HR systems

## Additional Resources

- [Backend README](./backend-java/README.md) - Detailed Java backend documentation
- [pom.xml](./backend-java/pom.xml) - Maven configuration (Java 25, Spring Boot 3.4.3, Maven 3.9.9)
- Spring Boot Docs: https://spring.io/projects/spring-boot
- Java 25 Docs: https://openjdk.org
- jjwt Documentation: https://github.com/jwtk/jjwt