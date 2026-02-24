import React, { useState, useContext, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { timeLogService } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import '../styles/AttendanceCalendar.css';

const AttendanceCalendar = () => {
  const { user, loading } = useContext(AuthContext);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [logs, setLogs] = useState([]);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    // Wait until user is loaded and we have a valid user ID
    if (!loading && user?.id) {
      fetchMonthlyLogs();
    }
  }, [currentDate, loading, user?.id]);

  const fetchMonthlyLogs = async () => {
    if (!user?.id || loading) return;
    
    setIsFetching(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const response = await timeLogService.getMonthlyAttendance(year, month);
      setLogs(response.data.logs);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setIsFetching(false);
    }
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getLogForDate = (day) => {
    return logs.find(log => {
      const logDate = new Date(log.date);
      return logDate.getDate() === day;
    });
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);

  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button onClick={previousMonth}>
          <ChevronLeft size={20} />
        </button>
        <h2>{monthName}</h2>
        <button onClick={nextMonth}>
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="weekdays">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>

      <div className="calendar-grid">
        {calendarDays.map((day, index) => {
          const log = day ? getLogForDate(day) : null;
          const status = log ? log.status : 'none';

          return (
            <div 
              key={index} 
              className={`calendar-day ${status}`}
            >
              {day && (
                <>
                  <div className="day-number">{day}</div>
                  {log && (
                    <div className="day-info">
                      <span className="time-badge">{log.status}</span>
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

      <div className="calendar-legend">
        <div><span className="legend-present"></span> Present</div>
        <div><span className="legend-absent"></span> Absent</div>
        <div><span className="legend-halfday"></span> Half Day</div>
      </div>
    </div>
  );
};

export default AttendanceCalendar;
