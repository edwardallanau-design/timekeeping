import { useState, useEffect } from 'react';
import '../styles/AnalogClock.css';

interface AnalogClockProps {
  timezone?: string;
  label?: string;
}

function getTimePartsInZone(date: Date, tz: string): { hours: number; minutes: number; seconds: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  }).formatToParts(date);

  const get = (type: string): number => {
    const part = parts.find(p => p.type === type);
    return part ? parseInt(part.value, 10) : 0;
  };

  return {
    hours: get('hour') % 12,
    minutes: get('minute'),
    seconds: get('second'),
  };
}

function AnalogClock({ timezone, label }: AnalogClockProps) {
  const [time, setTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  let hours: number;
  let minutes: number;
  let seconds: number;

  if (timezone) {
    const parts = getTimePartsInZone(time, timezone);
    hours = parts.hours;
    minutes = parts.minutes;
    seconds = parts.seconds;
  } else {
    hours = time.getHours() % 12;
    minutes = time.getMinutes();
    seconds = time.getSeconds();
  }

  const secondDegrees = (seconds / 60) * 360;
  const minuteDegrees = (minutes / 60) * 360 + (seconds / 60) * 6;
  const hourDegrees = (hours / 12) * 360 + (minutes / 60) * 30;

  return (
    <div className="analog-clock-container">
      <div className="analog-clock">
        <div className="clock-face">
          <div className="hand hour-hand"   style={{ transform: `rotate(${hourDegrees}deg)` }} />
          <div className="hand minute-hand" style={{ transform: `rotate(${minuteDegrees}deg)` }} />
          <div className="hand second-hand" style={{ transform: `rotate(${secondDegrees}deg)` }} />
          <div className="center-dot" />
        </div>
      </div>
      {label && <div className="clock-label">{label}</div>}
    </div>
  );
}

export default AnalogClock;
