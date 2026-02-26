import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { timeLogService } from '../services/api';
import { LogOut } from 'lucide-react';
import AnalogClock from './AnalogClock';
import type { TimeLogDto, TimesheetProps, ConfirmationData, DevTimeRequest } from '../types';
import axios from 'axios';
import '../styles/Timesheet.css';

const COMMON_TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Manila',
  'Australia/Sydney',
  'Pacific/Auckland',
];

function Timesheet({ onTimeLogUpdate }: TimesheetProps) {
  const { user, isDeveloper, logout, loading } = useAuth();
  const [todayLog, setTodayLog]             = useState<TimeLogDto | null>(null);
  const [isFetching, setIsFetching]         = useState<boolean>(false);
  const [message, setMessage]               = useState<string>('');
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [confirmationData, setConfirmationData] = useState<ConfirmationData | null>(null);
  const [selectedTimezone, setSelectedTimezone] = useState<string>(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const [customDateTime, setCustomDateTime] = useState<string>('');
  const [usedDevMode, setUsedDevMode] = useState<boolean | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<boolean>(false);
  const [dateToDelete, setDateToDelete] = useState<string>('');

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
      // Get user's local timezone and current local time
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const dateTimeString = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;

      const response = await timeLogService.timeInWithDateTime({
        dateTime: dateTimeString,
        timezone: userTimezone,
      });
      setTodayLog(response.data);
      setUsedDevMode(false);
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
      // Get user's local timezone and current local time
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const dateTimeString = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;

      const response = await timeLogService.timeOutWithDateTime({
        dateTime: dateTimeString,
        timezone: userTimezone,
      });
      setTodayLog(response.data);
      setUsedDevMode(null);
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

  const handleDeleteTimeLog = (): void => {
    if (!customDateTime) {
      setMessage('Please select a date to delete');
      return;
    }

    // Extract date from customDateTime (format: "YYYY-MM-DDTHH:mm")
    const date = customDateTime.substring(0, 10);
    setDateToDelete(date);
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteTimeLog = async (): Promise<void> => {
    setShowDeleteConfirmation(false);
    setIsFetching(true);
    try {
      await timeLogService.deleteTimeLog(dateToDelete);
      setMessage('Time log deleted successfully!');
      setCustomDateTime('');
      setDateToDelete('');
      onTimeLogUpdate();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setMessage((err.response?.data as { message?: string })?.message ?? 'Error deleting time log');
      } else {
        setMessage('Error deleting time log');
      }
    } finally {
      setIsFetching(false);
    }
  };

  const cancelDeleteTimeLog = (): void => {
    setShowDeleteConfirmation(false);
    setDateToDelete('');
  };

  const handleDevTimeIn = async (): Promise<void> => {
    if (!customDateTime) {
      setMessage('Please select a date and time');
      return;
    }

    setIsFetching(true);
    try {
      // Format datetime directly without UTC conversion to preserve local timezone
      const dateTimeFormatted = customDateTime.length === 16 ? `${customDateTime}:00` : customDateTime;
      const request: DevTimeRequest = {
        dateTime: dateTimeFormatted,
        timezone: selectedTimezone,
      };
      const response = await timeLogService.timeInCustom(request);
      setTodayLog(response.data);
      setUsedDevMode(true);
      setMessage('Dev Time In recorded successfully!');
      setCustomDateTime('');
      onTimeLogUpdate();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setMessage((err.response?.data as { message?: string })?.message ?? 'Error recording dev time in');
      } else {
        setMessage('Error recording dev time in');
      }
    } finally {
      setIsFetching(false);
    }
  };

  const handleDevTimeOut = async (): Promise<void> => {
    if (!customDateTime) {
      setMessage('Please select a date and time');
      return;
    }

    setIsFetching(true);
    try {
      // Format datetime directly without UTC conversion to preserve local timezone
      const dateTimeFormatted = customDateTime.length === 16 ? `${customDateTime}:00` : customDateTime;
      const request: DevTimeRequest = {
        dateTime: dateTimeFormatted,
        timezone: selectedTimezone,
      };
      const response = await timeLogService.timeOutCustom(request);
      setTodayLog(response.data);
      setUsedDevMode(null);
      setMessage('Dev Time Out recorded successfully!');
      setCustomDateTime('');
      onTimeLogUpdate();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setMessage((err.response?.data as { message?: string })?.message ?? 'Error recording dev time out');
      } else {
        setMessage('Error recording dev time out');
      }
    } finally {
      setIsFetching(false);
    }
  };

  const formatTime = (dateStr: string): string => new Date(dateStr).toLocaleTimeString();

  return (
    <div className="timesheet-container">
      <div className="timesheet-header">
        <h1>Welcome, {user?.name}</h1>
      </div>

      <div className="timesheet-content">
        <div className="time-card">
          {isDeveloper ? (
            <div className="dev-clocks">
              <AnalogClock label="Local" />
              <AnalogClock timezone={selectedTimezone} label={selectedTimezone} />
            </div>
          ) : (
            <AnalogClock />
          )}
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
              disabled={isFetching || usedDevMode === true || (todayLog !== null && !!todayLog.timeIn && !todayLog.timeOut)}
              className="btn btn-primary"
              title={usedDevMode === true ? 'Use Dev Time Out to complete dev mode shift' : ''}
            >
              {isFetching ? 'Processing...' : 'Time In'}
            </button>
            <button
              onClick={handleTimeOut}
              disabled={isFetching || usedDevMode === true || todayLog === null || !!todayLog.timeOut}
              className="btn btn-danger"
              title={usedDevMode === true ? 'Use Dev Time Out to complete dev mode shift' : ''}
            >
              {isFetching ? 'Processing...' : 'Time Out'}
            </button>
          </div>

          {isDeveloper && (
            <div className="dev-panel">
              <div className="dev-badge">DEV TOOLS</div>
              <div className="dev-controls">
                <div className="dev-form-group">
                  <label htmlFor="dev-timezone">Timezone:</label>
                  <select
                    id="dev-timezone"
                    value={selectedTimezone}
                    onChange={(e) => setSelectedTimezone(e.target.value)}
                    className="dev-select"
                  >
                    {COMMON_TIMEZONES.map((tz) => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>

                <div className="dev-form-group">
                  <label htmlFor="dev-datetime">Date & Time:</label>
                  <input
                    id="dev-datetime"
                    type="datetime-local"
                    value={customDateTime}
                    onChange={(e) => setCustomDateTime(e.target.value)}
                    className="dev-input"
                  />
                </div>

                <div className="dev-buttons">
                  <button
                    onClick={handleDevTimeIn}
                    disabled={isFetching || !customDateTime}
                    className="btn btn-dev-in"
                  >
                    {isFetching ? 'Processing...' : '[Dev Time In]'}
                  </button>
                  <button
                    onClick={handleDevTimeOut}
                    disabled={isFetching || !customDateTime}
                    className="btn btn-dev-out"
                  >
                    {isFetching ? 'Processing...' : '[Dev Time Out]'}
                  </button>
                  <button
                    onClick={handleDeleteTimeLog}
                    disabled={isFetching || !customDateTime}
                    className="btn btn-dev-delete"
                  >
                    {isFetching ? 'Processing...' : '[Delete]'}
                  </button>
                </div>
              </div>
            </div>
          )}
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

      {showDeleteConfirmation && (
        <div className="modal-overlay">
          <div className="confirmation-modal delete-modal">
            <h3>Delete Time Log</h3>
            <div className="confirmation-content">
              <p className="delete-warning">
                Are you sure you want to delete the time log for <strong>{dateToDelete}</strong>?
              </p>
              <p className="delete-note">
                This action cannot be undone.
              </p>
            </div>
            <div className="modal-buttons">
              <button onClick={confirmDeleteTimeLog} className="btn-delete">Delete</button>
              <button onClick={cancelDeleteTimeLog} className="btn-cancel">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Timesheet;
