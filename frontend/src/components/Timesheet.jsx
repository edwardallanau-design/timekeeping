import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { timeLogService } from '../services/api';
import { LogOut } from 'lucide-react';
import AnalogClock from './AnalogClock';
import '../styles/Timesheet.css';

const Timesheet = ({ onTimeLogUpdate }) => {
  const { user, logout, loading } = useContext(AuthContext);
  const [todayLog, setTodayLog] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [message, setMessage] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationData, setConfirmationData] = useState(null);

  useEffect(() => {
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
      // timeIn now returns TimeLogDto directly
      const response = await timeLogService.timeIn();
      setTodayLog(response.data);
      setMessage('Time in recorded successfully!');
      onTimeLogUpdate?.();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error recording time in');
    } finally {
      setIsFetching(false);
    }
  };

  const handleTimeOut = async () => {
    if (!todayLog) return;

    const timeInDate  = new Date(todayLog.timeIn);
    const timeOutDate = new Date();
    const diffMs      = timeOutDate - timeInDate;
    const hoursWorked = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;

    const status = hoursWorked < 8 ? 'half-day' : 'present';

    setConfirmationData({ hoursWorked, status });
    setShowConfirmation(true);
  };

  const confirmTimeOut = async () => {
    setShowConfirmation(false);
    setIsFetching(true);
    try {
      // timeOut now returns TimeLogDto directly
      const response = await timeLogService.timeOut();
      setTodayLog(response.data);
      setMessage('Time out recorded successfully!');
      onTimeLogUpdate?.();
      setConfirmationData(null);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error recording time out');
    } finally {
      setIsFetching(false);
    }
  };

  const cancelTimeOut = () => {
    setShowConfirmation(false);
    setConfirmationData(null);
  };

  const formatTime = (date) => new Date(date).toLocaleTimeString();

  return (
    <div className="timesheet-container">
      <div className="timesheet-header">
        <h1>Welcome, {user?.name}</h1>
      </div>

      <div className="timesheet-content">
        <div className="time-card">
          <AnalogClock />
          <h2>Today&apos;s Attendance</h2>

          {message && <div className="message">{message}</div>}

          <div className="time-info">
            {todayLog && (
              <>
                <p>Time In: {formatTime(todayLog.timeIn)}</p>
                {todayLog.timeOut && <p>Time Out: {formatTime(todayLog.timeOut)}</p>}
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

      <div className="timesheet-footer">
        <button onClick={logout} className="logout-btn">
          <LogOut size={20} />
          Logout
        </button>
      </div>

      {showConfirmation && confirmationData && (
        <div className="modal-overlay">
          <div className="confirmation-modal">
            <h3>Confirm Time Out</h3>
            <div className="confirmation-content">
              <p className="hours-display">
                Total Hours Worked: <strong>{confirmationData.hoursWorked}h</strong>
              </p>
              <p className="status-display">
                Status: <strong>{confirmationData.status.toUpperCase()}</strong>
              </p>
            </div>
            <div className="modal-buttons">
              <button onClick={confirmTimeOut} className="btn-confirm">Confirm</button>
              <button onClick={cancelTimeOut}  className="btn-cancel">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timesheet;
