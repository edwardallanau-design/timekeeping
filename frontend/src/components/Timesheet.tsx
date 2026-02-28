import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { timeLogService } from '../services/api';
import { ChevronDown } from 'lucide-react';
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
  const { user, isDeveloper, loading } = useAuth();
  const [todayLog, setTodayLog]               = useState<TimeLogDto | null>(null);
  const [isFetching, setIsFetching]           = useState<boolean>(false);
  const [message, setMessage]                 = useState<string>('');
  const [messageType, setMessageType]         = useState<'success' | 'error'>('success');
  const [showConfirmation, setShowConfirmation]   = useState<boolean>(false);
  const [confirmationData, setConfirmationData]   = useState<ConfirmationData | null>(null);
  const [selectedTimezone, setSelectedTimezone]   = useState<string>(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const [customDateTime, setCustomDateTime]   = useState<string>('');
  const [usedDevMode, setUsedDevMode]         = useState<boolean | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<boolean>(false);
  const [dateToDelete, setDateToDelete]       = useState<string>('');
  const [showDevPanel, setShowDevPanel]       = useState<boolean>(false);
  const [, forceUpdate]                       = useState<number>(0);

  // Re-render every minute while actively clocked in to keep duration live
  useEffect(() => {
    if (todayLog && !todayLog.timeOut) {
      const interval = setInterval(() => forceUpdate(n => n + 1), 60000);
      return () => clearInterval(interval);
    }
  }, [todayLog]);

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

  const showMsg = (msg: string, type: 'success' | 'error' = 'success'): void => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  const getLocalDateTimeString = (): string => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  };

  const handleTimeIn = async (): Promise<void> => {
    setIsFetching(true);
    try {
      const response = await timeLogService.timeInWithDateTime({
        dateTime: getLocalDateTimeString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      setTodayLog(response.data);
      setUsedDevMode(false);
      showMsg('Time in recorded successfully!');
      onTimeLogUpdate();
    } catch (err) {
      showMsg(
        axios.isAxiosError(err)
          ? ((err.response?.data as { message?: string })?.message ?? 'Error recording time in')
          : 'Error recording time in',
        'error'
      );
    } finally {
      setIsFetching(false);
    }
  };

  const handleTimeOut = (): void => {
    if (!todayLog) return;
    const diffMs      = Date.now() - new Date(todayLog.timeIn).getTime();
    const hoursWorked = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
    const status: ConfirmationData['status'] = hoursWorked < 8 ? 'half-day' : 'present';
    setConfirmationData({ hoursWorked, status });
    setShowConfirmation(true);
  };

  const confirmTimeOut = async (): Promise<void> => {
    setShowConfirmation(false);
    setIsFetching(true);
    try {
      const response = await timeLogService.timeOutWithDateTime({
        dateTime: getLocalDateTimeString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      setTodayLog(response.data);
      setUsedDevMode(null);
      setConfirmationData(null);
      showMsg('Time out recorded successfully!');
      onTimeLogUpdate();
    } catch (err) {
      showMsg(
        axios.isAxiosError(err)
          ? ((err.response?.data as { message?: string })?.message ?? 'Error recording time out')
          : 'Error recording time out',
        'error'
      );
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
      showMsg('Please select a date to delete', 'error');
      return;
    }
    setDateToDelete(customDateTime.substring(0, 10));
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteTimeLog = async (): Promise<void> => {
    setShowDeleteConfirmation(false);
    setIsFetching(true);
    try {
      await timeLogService.deleteTimeLog(dateToDelete);
      showMsg('Time log deleted successfully!');
      setCustomDateTime('');
      setDateToDelete('');
      onTimeLogUpdate();
    } catch (err) {
      showMsg(
        axios.isAxiosError(err)
          ? ((err.response?.data as { message?: string })?.message ?? 'Error deleting time log')
          : 'Error deleting time log',
        'error'
      );
    } finally {
      setIsFetching(false);
    }
  };

  const cancelDeleteTimeLog = (): void => {
    setShowDeleteConfirmation(false);
    setDateToDelete('');
  };

  const handleDevTimeIn = async (): Promise<void> => {
    if (!customDateTime) { showMsg('Please select a date and time', 'error'); return; }
    setIsFetching(true);
    try {
      const request: DevTimeRequest = {
        dateTime: customDateTime.length === 16 ? `${customDateTime}:00` : customDateTime,
        timezone: selectedTimezone,
      };
      const response = await timeLogService.timeInCustom(request);
      setTodayLog(response.data);
      setUsedDevMode(true);
      setCustomDateTime('');
      showMsg('Dev Time In recorded successfully!');
      onTimeLogUpdate();
    } catch (err) {
      showMsg(
        axios.isAxiosError(err)
          ? ((err.response?.data as { message?: string })?.message ?? 'Error recording dev time in')
          : 'Error recording dev time in',
        'error'
      );
    } finally {
      setIsFetching(false);
    }
  };

  const handleDevTimeOut = async (): Promise<void> => {
    if (!customDateTime) { showMsg('Please select a date and time', 'error'); return; }
    setIsFetching(true);
    try {
      const request: DevTimeRequest = {
        dateTime: customDateTime.length === 16 ? `${customDateTime}:00` : customDateTime,
        timezone: selectedTimezone,
      };
      const response = await timeLogService.timeOutCustom(request);
      setTodayLog(response.data);
      setUsedDevMode(null);
      setCustomDateTime('');
      showMsg('Dev Time Out recorded successfully!');
      onTimeLogUpdate();
    } catch (err) {
      showMsg(
        axios.isAxiosError(err)
          ? ((err.response?.data as { message?: string })?.message ?? 'Error recording dev time out')
          : 'Error recording dev time out',
        'error'
      );
    } finally {
      setIsFetching(false);
    }
  };

  const formatTime = (dateStr: string): string =>
    new Date(dateStr).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

  const getLiveDuration = (): string => {
    if (!todayLog) return '';
    const start    = new Date(todayLog.timeIn).getTime();
    const end      = todayLog.timeOut ? new Date(todayLog.timeOut).getTime() : Date.now();
    const totalMin = Math.floor((end - start) / 60000);
    const h        = Math.floor(totalMin / 60);
    const m        = totalMin % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const getProgressPercent = (): number => {
    if (!todayLog) return 0;
    const start = new Date(todayLog.timeIn).getTime();
    const end   = todayLog.timeOut ? new Date(todayLog.timeOut).getTime() : Date.now();
    const hours = (end - start) / (1000 * 60 * 60);
    return Math.min(Math.round((hours / 8) * 100), 100);
  };

  const getStatusInfo = (): { label: string; cssClass: string } => {
    if (!todayLog)         return { label: 'Not clocked in', cssClass: 'status-idle'    };
    if (!todayLog.timeOut) return { label: 'Active',         cssClass: 'status-active'  };
    switch (todayLog.status) {
      case 'PRESENT':  return { label: 'Present',  cssClass: 'status-present' };
      case 'HALF_DAY': return { label: 'Half Day', cssClass: 'status-halfday' };
      case 'ABSENT':   return { label: 'Absent',   cssClass: 'status-absent'  };
      default:         return { label: 'Done',     cssClass: 'status-present' };
    }
  };

  const canTimeIn  = !isFetching && usedDevMode !== true &&
    !(todayLog !== null && !!todayLog.timeIn && !todayLog.timeOut);
  const canTimeOut = !isFetching && usedDevMode !== true &&
    todayLog !== null && !!todayLog.timeIn && !todayLog.timeOut;

  const { label: statusLabel, cssClass: statusClass } = getStatusInfo();
  const progress  = getProgressPercent();
  const duration  = getLiveDuration();
  const todayDate = new Date().toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="timesheet-container">
      <div className="timesheet-content">
        {isDeveloper ? (
          <div className="dev-clocks">
            <AnalogClock label="Local" />
            <AnalogClock timezone={selectedTimezone} label={selectedTimezone} />
          </div>
        ) : (
          <div className="clock-wrapper">
            <AnalogClock />
          </div>
        )}

        <div className="today-date">{todayDate}</div>

        <div className={`status-pill ${statusClass}`}>
          <span className="status-dot" />
          {statusLabel}
        </div>

        {message && (
          <div className={`message ${messageType === 'error' ? 'message-error' : ''}`}>
            {message}
          </div>
        )}

        {todayLog && (
          <div className="time-summary">
            <div className="time-row">
              <div className="time-block">
                <div className="time-label-sm">In</div>
                <div className="time-val">{formatTime(todayLog.timeIn)}</div>
              </div>
              <div className="time-arrow">→</div>
              <div className="time-block">
                <div className="time-label-sm">Out</div>
                <div className="time-val">
                  {todayLog.timeOut
                    ? formatTime(todayLog.timeOut)
                    : <span className="time-pending">—</span>}
                </div>
              </div>
            </div>
            <div className="duration-row">
              <span>{duration}</span>
              <span className="duration-goal">/ 8h goal</span>
            </div>
            <div className="progress-bar">
              <div
                className={`progress-fill ${todayLog.timeOut ? 'fill-done' : 'fill-active'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="button-group">
          <button
            onClick={handleTimeIn}
            disabled={!canTimeIn}
            className={`btn ${canTimeIn ? 'btn-primary' : 'btn-muted'}`}
            title={usedDevMode === true ? 'Use Dev Time Out to complete dev mode shift' : ''}
          >
            {isFetching ? 'Processing...' : 'Clock In'}
          </button>
          <button
            onClick={handleTimeOut}
            disabled={!canTimeOut}
            className={`btn ${canTimeOut ? 'btn-danger' : 'btn-muted'}`}
            title={usedDevMode === true ? 'Use Dev Time Out to complete dev mode shift' : ''}
          >
            {isFetching ? 'Processing...' : 'Clock Out'}
          </button>
        </div>

        {isDeveloper && (
          <div className="dev-panel">
            <button
              className="dev-panel-toggle"
              onClick={() => setShowDevPanel(prev => !prev)}
            >
              <span className="dev-badge">DEV TOOLS</span>
              <ChevronDown size={15} className={`dev-chevron ${showDevPanel ? 'rotated' : ''}`} />
            </button>

            {showDevPanel && (
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
                    {isFetching ? '...' : 'Dev In'}
                  </button>
                  <button
                    onClick={handleDevTimeOut}
                    disabled={isFetching || !customDateTime}
                    className="btn btn-dev-out"
                  >
                    {isFetching ? '...' : 'Dev Out'}
                  </button>
                  <button
                    onClick={handleDeleteTimeLog}
                    disabled={isFetching || !customDateTime}
                    className="btn btn-dev-delete"
                  >
                    {isFetching ? '...' : 'Delete'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showConfirmation && confirmationData && (
        <div className="modal-overlay">
          <div className="confirmation-modal">
            <h3>Confirm Clock Out</h3>
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
              <p className="delete-note">This action cannot be undone.</p>
            </div>
            <div className="modal-buttons">
              <button onClick={confirmDeleteTimeLog} className="btn-delete">Delete</button>
              <button onClick={cancelDeleteTimeLog}  className="btn-cancel">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Timesheet;
