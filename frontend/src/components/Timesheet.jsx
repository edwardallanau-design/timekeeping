import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { timeLogService } from '../services/api';
import { Clock, LogOut } from 'lucide-react';
import '../styles/Timesheet.css';

const Timesheet = () => {
  const { user, logout, loading } = useContext(AuthContext);
  const [todayLog, setTodayLog] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Wait until user is loaded and we have a valid user ID
    if (!loading && user?.id) {
      fetchTodayLog();
    }
  }, [loading, user?.id]);

  const fetchTodayLog = async () => {
    try {
      const response = await timeLogService.getDailyLog();
      setTodayLog(response.data.timeLog);
    } catch (error) {
      console.error('Error fetching today log:', error);
    }
  };

  const handleTimeIn = async () => {
    setIsFetching(true);
    try {
      const response = await timeLogService.timeIn();
      setTodayLog(response.data.timeLog);
      setMessage('Time in recorded successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error recording time in');
    } finally {
      setIsFetching(false);
    }
  };

  const handleTimeOut = async () => {
    setIsFetching(true);
    try {
      const response = await timeLogService.timeOut();
      setTodayLog(response.data.timeLog);
      setMessage('Time out recorded successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error recording time out');
    } finally {
      setIsFetching(false);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString();
  };

  return (
    <div className="timesheet-container">
      <div className="timesheet-header">
        <h1>Welcome, {user?.name}</h1>
        <button onClick={logout} className="logout-btn">
          <LogOut size={20} />
          Logout
        </button>
      </div>

      <div className="timesheet-content">
        <div className="time-card">
          <Clock size={48} />
          <h2>Today's Attendance</h2>
          
          {message && <div className="message">{message}</div>}

          <div className="time-info">
            {todayLog && (
              <>
                <p>Time In: {formatTime(todayLog.timeIn)}</p>
                {todayLog.timeOut && <p>Time Out: {formatTime(todayLog.timeOut)}</p>}
                {todayLog.hoursWorked && <p>Hours Worked: {todayLog.hoursWorked}h</p>}
              </>
            )}
          </div>

          <div className="button-group">
            <button 
              onClick={handleTimeIn} 
              disabled={isFetching || (todayLog && todayLog.timeIn && !todayLog.timeOut)}
              className="btn btn-primary"
            >
              {isFetching ? 'Processing...' : 'Time In'}
            </button>
            <button 
              onClick={handleTimeOut} 
              disabled={isFetching || !todayLog || todayLog.timeOut}
              className="btn btn-danger"
            >
              {isFetching ? 'Processing...' : 'Time Out'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timesheet;
