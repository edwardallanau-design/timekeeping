import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { timeLogService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { AttendanceLog, AttendanceCalendarProps, AttendanceStatus } from '../types';
import '../styles/AttendanceCalendar.css';

/** Converts backend enum (e.g. HALF_DAY) to a CSS-friendly class (e.g. half-day) */
function statusToClass(status: AttendanceStatus | undefined): string {
  if (!status) return 'none';
  return status.toLowerCase().replace('_', '-');
}

/** Human-readable label for display */
function statusLabel(status: AttendanceStatus): string {
  const labels: Record<AttendanceStatus, string> = {
    PRESENT:  'Present',
    HALF_DAY: 'Half Day',
    ABSENT:   'Absent',
  };
  return labels[status] ?? status;
}

interface AttendanceCalendarExtendedProps extends AttendanceCalendarProps {
  onDateSelected?: (date: string) => void;
}

function AttendanceCalendar({ refreshTrigger, onDateSelected }: AttendanceCalendarExtendedProps) {
  const { user, loading } = useAuth();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [logs, setLogs]               = useState<AttendanceLog[]>([]);
  const [isFetching, setIsFetching]   = useState<boolean>(false);

  useEffect(() => {
    if (!loading && user?.id) {
      fetchMonthlyLogs();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate, loading, user?.id, refreshTrigger]);

  const fetchMonthlyLogs = async (): Promise<void> => {
    if (!user?.id || loading) return;
    setIsFetching(true);
    try {
      const year  = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const response = await timeLogService.getMonthlyAttendance(year, month);
      setLogs(response.data.logs);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setIsFetching(false);
    }
  };

  const getDaysInMonth  = (date: Date): number =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  const getFirstDayOfMonth = (date: Date): number =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const getLogForDay = (day: number): AttendanceLog | undefined =>
    logs.find(log => new Date(log.date + 'T00:00:00').getDate() === day);

  const previousMonth = (): void =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));

  const nextMonth = (): void =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  const handleDayClick = (day: number): void => {
    if (onDateSelected) {
      const year   = currentDate.getFullYear();
      const month  = String(currentDate.getMonth() + 1).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      onDateSelected(`${year}-${month}-${dayStr}`);
    }
  };

  // Monthly summary stats
  const presentCount  = logs.filter(l => l.status === 'PRESENT').length;
  const halfDayCount  = logs.filter(l => l.status === 'HALF_DAY').length;
  const absentCount   = logs.filter(l => l.status === 'ABSENT').length;
  const totalHours    = logs.reduce((sum, l) => sum + l.hoursWorked, 0);
  const totalHoursDisplay = totalHours % 1 === 0
    ? `${totalHours}h`
    : `${totalHours.toFixed(1)}h`;

  // Today highlight
  const today = new Date();
  const isToday = (day: number): boolean =>
    currentDate.getFullYear() === today.getFullYear() &&
    currentDate.getMonth()    === today.getMonth()    &&
    day                       === today.getDate();

  const monthName   = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay    = getFirstDayOfMonth(currentDate);

  const calendarDays: (number | null)[] = [
    ...Array<null>(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="calendar-container">
      {/* Monthly stats bar */}
      <div className="calendar-stats">
        <div className="stat-item stat-present">
          <span className="stat-count">{presentCount}</span>
          <span className="stat-label">Present</span>
        </div>
        <div className="stat-item stat-halfday">
          <span className="stat-count">{halfDayCount}</span>
          <span className="stat-label">Half Day</span>
        </div>
        <div className="stat-item stat-absent">
          <span className="stat-count">{absentCount}</span>
          <span className="stat-label">Absent</span>
        </div>
        <div className="stat-item stat-hours">
          <span className="stat-count">{totalHoursDisplay}</span>
          <span className="stat-label">Total</span>
        </div>
      </div>

      {/* Month navigation */}
      <div className="calendar-header">
        <button onClick={previousMonth} aria-label="Previous month">
          <ChevronLeft size={20} />
        </button>
        <h2>{monthName}</h2>
        <button onClick={nextMonth} aria-label="Next month">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="weekdays">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="calendar-grid-wrapper">
        <div className="calendar-grid">
          {calendarDays.map((day, index) => {
            const log        = day !== null ? getLogForDay(day) : undefined;
            const cssClass   = log ? statusToClass(log.status) : 'none';
            const isClickable = day !== null && !!onDateSelected;
            const todayClass = day !== null && isToday(day) ? 'today' : '';

            return (
              <div
                key={index}
                className={`calendar-day ${cssClass} ${todayClass} ${isClickable ? 'clickable' : ''}`}
                onClick={() => day !== null && handleDayClick(day)}
                role={day !== null ? 'button' : undefined}
                tabIndex={day !== null ? 0 : undefined}
                onKeyDown={(e) => {
                  if (day !== null && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    handleDayClick(day);
                  }
                }}
              >
                {day !== null && (
                  <>
                    <div className="day-number">{day}</div>
                    {log && (
                      <div className="day-info">
                        <span className="time-badge">{statusLabel(log.status)}</span>
                        {log.hoursWorked > 0 && (
                          <span className="hours">{log.hoursWorked}h</span>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        {isFetching && <div className="calendar-loading-overlay" />}
      </div>

      {/* Legend */}
      <div className="calendar-legend">
        <div><span className="legend-dot legend-present" /> Present</div>
        <div><span className="legend-dot legend-halfday" /> Half Day</div>
        <div><span className="legend-dot legend-absent"  /> Absent</div>
      </div>
    </div>
  );
}

export default AttendanceCalendar;
