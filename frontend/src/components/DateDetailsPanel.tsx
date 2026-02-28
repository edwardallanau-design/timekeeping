import { useEffect, useState } from 'react';
import { Calendar, Clock, X } from 'lucide-react';
import { timeLogService } from '../services/api';
import type { TimeLogDto } from '../types';
import '../styles/DateDetailsPanel.css';

interface DateDetailsPanelProps {
  selectedDate: string | null;
  onClose: () => void;
  refreshTrigger?: number;
}

function DateDetailsPanel({ selectedDate, onClose, refreshTrigger }: DateDetailsPanelProps) {
  const [timeLog, setTimeLog] = useState<TimeLogDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string>('');

  useEffect(() => {
    if (!selectedDate) {
      setTimeLog(null);
      return;
    }

    const fetchDayDetails = async (): Promise<void> => {
      setLoading(true);
      setError('');
      try {
        const response = await timeLogService.getDailyLog(selectedDate);
        if (response.data.timeLog) {
          setTimeLog(response.data.timeLog);
        } else {
          setTimeLog(null);
          setError('');
        }
      } catch (err) {
        console.error('Error fetching daily log:', err);
        setError('Failed to load time log details');
      } finally {
        setLoading(false);
      }
    };

    fetchDayDetails();
  }, [selectedDate, refreshTrigger]);

  if (!selectedDate) {
    return (
      <div className="details-panel empty">
        <div className="empty-state">
          <Calendar size={36} strokeWidth={1.5} />
          <p>Select a date to<br />view details</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('default', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  const formatTime = (dateStr: string | null): string => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  const getProgressPercent = (log: TimeLogDto): number =>
    Math.min(Math.round((log.hoursWorked / 8) * 100), 100);

  const statusCssClass = (log: TimeLogDto): string =>
    `detail-status status-${log.status.toLowerCase().replace('_', '-')}`;

  return (
    <div className="details-panel">
      <div className="panel-header">
        <h3>Date Details</h3>
        <button onClick={onClose} className="close-btn" aria-label="Close">
          <X size={18} />
        </button>
      </div>

      <div className="panel-date">{formatDate(selectedDate)}</div>

      {loading && (
        <div className="panel-loading">
          <Clock size={20} />
          Loading...
        </div>
      )}

      {error && <div className="panel-error">{error}</div>}

      {timeLog && (
        <div className="time-details">
          {/* Clock In → Clock Out */}
          <div className="detail-time-row">
            <div className="detail-time-block">
              <div className="detail-time-label">Clock In</div>
              <div className="detail-time-value">{formatTime(timeLog.timeIn)}</div>
            </div>
            <div className="detail-arrow">→</div>
            <div className="detail-time-block">
              <div className="detail-time-label">Clock Out</div>
              <div className={`detail-time-value ${!timeLog.timeOut ? 'time-pending' : ''}`}>
                {formatTime(timeLog.timeOut)}
              </div>
            </div>
          </div>

          {/* Hours progress */}
          <div className="detail-hours-section">
            <div className="detail-hours-header">
              <span className="detail-hours-value">
                {timeLog.hoursWorked > 0 ? `${timeLog.hoursWorked}h worked` : 'In progress'}
              </span>
              <span className="detail-hours-goal">/ 8h</span>
            </div>
            <div className="detail-progress-track">
              <div
                className={`detail-progress-bar ${timeLog.timeOut ? 'bar-done' : 'bar-active'}`}
                style={{ width: `${getProgressPercent(timeLog)}%` }}
              />
            </div>
          </div>

          {/* Status badge */}
          <div className={statusCssClass(timeLog)}>
            {timeLog.status.replace('_', ' ')}
          </div>

          {/* Timezone */}
          {timeLog.timezone && (
            <div className="detail-meta">
              <span className="detail-meta-label">Timezone</span>
              <span className="detail-meta-value">{timeLog.timezone}</span>
            </div>
          )}

          {/* Notes */}
          {timeLog.notes && (
            <div className="detail-meta">
              <span className="detail-meta-label">Notes</span>
              <span className="detail-meta-value">{timeLog.notes}</span>
            </div>
          )}
        </div>
      )}

      {!timeLog && !loading && !error && (
        <div className="panel-empty">
          <div className="empty-state">
            <Clock size={28} strokeWidth={1.5} />
            <p>No time log recorded<br />for this date</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default DateDetailsPanel;
