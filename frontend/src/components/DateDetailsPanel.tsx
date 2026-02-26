import { useEffect, useState } from 'react';
import { Clock, X } from 'lucide-react';
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
  const [error, setError] = useState<string>('');

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
          setError('No time log found for this date');
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
        <p>Select a date to view details</p>
      </div>
    );
  }

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('default', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateStr: string | null): string => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('default', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="details-panel">
      <div className="panel-header">
        <h3>Date Details</h3>
        <button onClick={onClose} className="close-btn" aria-label="Close">
          <X size={20} />
        </button>
      </div>

      <div className="panel-date">{formatDate(selectedDate)}</div>

      {loading && <div className="panel-loading">Loading...</div>}

      {error && <div className="panel-error">{error}</div>}

      {timeLog && (
        <div className="time-details">
          <div className="time-detail-item">
            <div className="time-label">
              <Clock size={16} />
              Time In
            </div>
            <div className="time-value">
              {formatTime(timeLog.timeIn)}
            </div>
          </div>

          <div className="time-detail-item">
            <div className="time-label">
              <Clock size={16} />
              Time Out
            </div>
            <div className="time-value">
              {formatTime(timeLog.timeOut) || <span className="not-clocked">Not clocked out</span>}
            </div>
          </div>

          <div className="time-detail-item">
            <div className="time-label">Duration</div>
            <div className="time-value">
              {timeLog.hoursWorked > 0 ? `${timeLog.hoursWorked}h` : '—'}
            </div>
          </div>

          <div className="time-detail-item">
            <div className="time-label">Status</div>
            <div className={`time-value status-${timeLog.status.toLowerCase().replace('_', '-')}`}>
              {timeLog.status.replace('_', ' ')}
            </div>
          </div>

          {timeLog.timezone && (
            <div className="time-detail-item">
              <div className="time-label">Timezone</div>
              <div className="time-value">{timeLog.timezone}</div>
            </div>
          )}

          {timeLog.notes && (
            <div className="time-detail-item notes">
              <div className="time-label">Notes</div>
              <div className="time-value">{timeLog.notes}</div>
            </div>
          )}
        </div>
      )}

      {!timeLog && !loading && !error && (
        <div className="panel-empty">
          <p>No time log recorded for this date</p>
        </div>
      )}
    </div>
  );
}

export default DateDetailsPanel;
