import React, { useContext, useState } from 'react';
import Timesheet from '../components/Timesheet';
import AttendanceCalendar from '../components/AttendanceCalendar';
import { AuthContext } from '../context/AuthContext';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user, loading } = useContext(AuthContext);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleTimeLogUpdate = () => {
    // Increment to trigger calendar refresh
    setRefreshTrigger(prev => prev + 1);
  };

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
        <Timesheet onTimeLogUpdate={handleTimeLogUpdate} />
        <div className="calendar-section">
          <h2>Attendance Calendar</h2>
          <AttendanceCalendar refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
