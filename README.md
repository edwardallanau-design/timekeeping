# Timekeeping System - MERN Stack

A complete timekeeping system built with MongoDB, Express, React, and Node.js.

## Features

- **User Authentication**: Secure login and registration system
- **Time Tracking**: Clock in and clock out functionality
- **Attendance Calendar**: Visual representation of attendance with monthly/yearly views
- **Work Hours Calculation**: Automatic calculation of hours worked
- **Attendance Statistics**: Track working days, hours, and attendance status

## Project Structure

```
timekeeping/
├── backend/                 # Express.js API server
│   ├── models/             # MongoDB schemas (User, TimeLog)
│   ├── routes/             # API routes
│   ├── controllers/        # Route handlers
│   ├── middleware/         # Auth middleware
│   ├── server.js           # Main server file
│   ├── package.json
│   └── .env               # Environment variables
│
└── frontend/              # React application
    ├── src/
    │   ├── pages/         # Page components (Login, Register, Dashboard)
    │   ├── components/    # Reusable components (Timesheet, Calendar)
    │   ├── context/       # React context for auth
    │   ├── services/      # API services
    │   ├── styles/        # CSS files
    │   ├── App.jsx
    │   └── index.jsx
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or Atlas)

## Installation

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/timekeeping
   JWT_SECRET=your_secret_key_here
   NODE_ENV=development
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (protected)

### Time Logging
- `POST /api/timelog/time-in` - Clock in (protected)
- `POST /api/timelog/time-out` - Clock out (protected)
- `GET /api/timelog/daily/:userId` - Get daily log (protected)
- `GET /api/timelog/monthly/:userId` - Get monthly attendance (protected)
- `GET /api/timelog/yearly/:userId` - Get yearly statistics (protected)

## Usage

1. **Register/Login**: Create an account or login with existing credentials
2. **Clock In**: Click "Time In" button when starting work
3. **Clock Out**: Click "Time Out" button when finishing work
4. **View Calendar**: See attendance history in the calendar view
5. **Track Hours**: View hours worked and attendance status

## Technologies Used

### Backend
- Express.js - Web framework
- MongoDB - Database
- Mongoose - ODM
- JWT - Authentication
- bcryptjs - Password hashing
- CORS - Cross-origin resource sharing

### Frontend
- React - UI library
- React Router - Navigation
- Axios - HTTP client
- Lucide React - Icons
- Vite - Build tool
- CSS3 - Styling

## Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Protected API routes with authentication middleware
- Input validation
- CORS configuration

## Future Enhancements

- Email notifications
- Overtime tracking
- Leave management
- Admin dashboard
- Export attendance reports
- Mobile app
- Team management
- Department-wise statistics

## License

MIT License

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## Support

For support, email support@timekeeping.com or open an issue in the repository.
