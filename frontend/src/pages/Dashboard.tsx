import { useState } from 'react';
import Timesheet from '../components/Timesheet';
import AttendanceCalendar from '../components/AttendanceCalendar';
import DateDetailsPanel from '../components/DateDetailsPanel';
import { useAuth } from '../context/AuthContext';
import '../styles/Dashboard.css';

function Dashboard() {
  const { loading } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const handleTimeLogUpdate = (): void => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleDateSelected = (date: string): void => {
    setSelectedDate(date);
  };

  const handleCloseDetails = (): void => {
    setSelectedDate(null);
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
          <AttendanceCalendar refreshTrigger={refreshTrigger} onDateSelected={handleDateSelected} />
        </div>
        <div className="details-section">
          <DateDetailsPanel selectedDate={selectedDate} onClose={handleCloseDetails} refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
