import { useState, useEffect } from 'react';
import '../styles/AnalogClock.css';

function AnalogClock() {
  const [time, setTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours   = time.getHours() % 12;
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  const secondDegrees = (seconds / 60) * 360;
  const minuteDegrees = (minutes / 60) * 360 + (seconds / 60) * 6;
  const hourDegrees   = (hours / 12) * 360 + (minutes / 60) * 30;

  return (
    <div className="analog-clock">
      <div className="clock-face">
        <div className="hand hour-hand"   style={{ transform: `rotate(${hourDegrees}deg)` }} />
        <div className="hand minute-hand" style={{ transform: `rotate(${minuteDegrees}deg)` }} />
        <div className="hand second-hand" style={{ transform: `rotate(${secondDegrees}deg)` }} />
        <div className="center-dot" />
      </div>
    </div>
  );
}

export default AnalogClock;
