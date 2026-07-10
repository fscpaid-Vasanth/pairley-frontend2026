import React, { useState, useEffect, useRef } from 'react';

function pad(n) {
  return String(Math.floor(n)).padStart(2, '0');
}

function calcTimeLeft(endDate) {
  const end = endDate instanceof Date ? endDate : new Date(endDate);
  const diff = end - Date.now();
  if (diff <= 0) return null;
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds, totalSeconds };
}

const styles = {
  wrap: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontFamily: 'inherit',
    fontWeight: 700,
    fontSize: '13px',
    letterSpacing: '0.01em',
  },
  urgent: {
    color: '#dc2626',
    background: 'rgba(220,38,38,0.08)',
    borderRadius: '8px',
    padding: '4px 10px',
  },
  normal: {
    color: '#5B12D6',
    background: 'rgba(78,43,196,0.07)',
    borderRadius: '8px',
    padding: '4px 10px',
  },
  expired: {
    color: '#6b7280',
    background: 'rgba(107,114,128,0.08)',
    borderRadius: '8px',
    padding: '4px 10px',
  },
  label: {
    fontWeight: 500,
    fontSize: '11px',
    color: '#6b7280',
    display: 'block',
    marginBottom: '2px',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  timeBlock: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '2px',
    fontVariantNumeric: 'tabular-nums',
  },
  colon: {
    opacity: 0.6,
    fontWeight: 700,
  },
  segment: {
    minWidth: '22px',
    textAlign: 'center',
  },
};

export default function CountdownTimer({ endDate, label }) {
  const [timeLeft, setTimeLeft] = useState(() => calcTimeLeft(endDate));
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!endDate) return;
    setTimeLeft(calcTimeLeft(endDate));
    intervalRef.current = setInterval(() => {
      const t = calcTimeLeft(endDate);
      setTimeLeft(t);
      if (!t) clearInterval(intervalRef.current);
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [endDate]);

  if (!endDate) return null;

  if (!timeLeft) {
    return (
      <div style={styles.container}>
        {label && <span style={styles.label}>{label}</span>}
        <span style={{ ...styles.wrap, ...styles.expired }}>
          ❌ Offer Expired
        </span>
      </div>
    );
  }

  const isUrgent = timeLeft.totalSeconds < 86400; // less than 24 hours

  if (isUrgent) {
    const timeStr = `${pad(timeLeft.hours)}:${pad(timeLeft.minutes)}:${pad(timeLeft.seconds)}`;
    return (
      <div style={styles.container}>
        {label && <span style={styles.label}>{label}</span>}
        <span style={{ ...styles.wrap, ...styles.urgent }}>
          🔥 Hurry!&nbsp;
          <span style={styles.timeBlock}>
            <span style={styles.segment}>{pad(timeLeft.hours)}</span>
            <span style={styles.colon}>:</span>
            <span style={styles.segment}>{pad(timeLeft.minutes)}</span>
            <span style={styles.colon}>:</span>
            <span style={styles.segment}>{pad(timeLeft.seconds)}</span>
          </span>
          &nbsp;left
        </span>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {label && <span style={styles.label}>{label}</span>}
      <span style={{ ...styles.wrap, ...styles.normal }}>
        ⏳ Ends in&nbsp;
        {timeLeft.days > 0 && (
          <span>{timeLeft.days} {timeLeft.days === 1 ? 'Day' : 'Days'}&nbsp;</span>
        )}
        <span style={styles.timeBlock}>
          <span style={styles.segment}>{pad(timeLeft.hours)}</span>
          <span style={styles.colon}>:</span>
          <span style={styles.segment}>{pad(timeLeft.minutes)}</span>
          <span style={styles.colon}>:</span>
          <span style={styles.segment}>{pad(timeLeft.seconds)}</span>
        </span>
      </span>
    </div>
  );
}

