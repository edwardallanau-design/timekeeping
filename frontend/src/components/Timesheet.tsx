import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { timeLogService } from '../services/api';
import { LogOut } from 'lucide-react';
import AnalogClock from './AnalogClock';
import type { TimeLogDto, TimesheetProps, ConfirmationData } from '../types';
import axios from 'axios';
import '../styles/Timesheet.css';

function Timesheet({ onTimeLogUpdate }: TimesheetProps) {
  const { user, logout, loading } = useAuth();
  const [todayLog, setTodayLog]             = useState<TimeLogDto | null>(null);
  const [isFetching, setIsFetching]         = useState<boolean>(false);
  const [message, setMessage]               = useState<string>('');
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [confirmationData, setConfirmationData] = useState<ConfirmationData | null>(null);

  useEffect(() => {
    if (!loading && user?.id) {
      fetchTodayLog();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user?.id]);

  const fetchTodayLog = async (): Promise<void> => {
    try {
      const response = await timeLogService.getDailyLog();
      setTodayLog(response.data.timeLog);
    } catch (error) {
      console.error('Error fetching today log:', error);
    }
  };

  const handleTimeIn = async (): Promise<void> => {
    setIsFetching(true);
    try {
      const response = await timeLogService.timeIn();
      setTodayLog(response.data);
      setMessage('Time in recorded successfully!');
      onTimeLogUpdate();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setMessage((err.response?.data as { message?: string })?.message ?? 'Error recording time in');
      } else {
        setMessage('Error recording time in');
      }
    } finally {
      setIsFetching(false);
    }
  };

  const handleTimeOut = (): void => {
    if (!todayLog) return;

    const timeInMs    = new Date(todayLog.timeIn).getTime();
    const timeOutMs   = Date.now();
    const diffMs      = timeOutMs - timeInMs;
    const hoursWorked = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
    const status: ConfirmationData['status'] = hoursWorked < 8 ? 'half-day' : 'present';

    setConfirmationData({ hoursWorked, status });
    setShowConfirmation(true);
  };

  const confirmTimeOut = async (): Promise<void> => {
    setShowConfirmation(false);
    setIsFetching(true);
    try {
      const response = await timeLogService.timeOut();
      setTodayLog(response.data);
      setMessage('Time out recorded successfully!');
      onTimeLogUpdate();
      setConfirmationData(null);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setMessage((err.response?.data as { message?: string })?.message ?? 'Error recording time out');
      } else {
        setMessage('Error recording time out');
      }
    } finally {
      setIsFetching(false);
    }
  };

  const cancelTimeOut = (): void => {
    setShowConfirmation(false);
    setConfirmationData(null);
  };

  const formatTime = (dateStr: string): string => new Date(dateStr).toLocaleTimeString();

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
              disabled={isFetching || (todayLog !== null && !!todayLog.timeIn && !todayLog.timeOut)}
              className="btn btn-primary"
            >
              {isFetching ? 'Processing...' : 'Time In'}
            </button>
            <button
              onClick={handleTimeOut}
              disabled={isFetching || todayLog === null || !!todayLog.timeOut}
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
}

export default Timesheet;
