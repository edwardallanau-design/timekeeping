import React, { useContext } from 'react';
import Timesheet from '../components/Timesheet';
import AttendanceCalendar from '../components/AttendanceCalendar';
import { AuthContext } from '../context/AuthContext';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-message">Loading your session...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="main-content">
        <Timesheet />
        <div className="calendar-section">
          <h2>Attendance Calendar</h2>
          <AttendanceCalendar />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
