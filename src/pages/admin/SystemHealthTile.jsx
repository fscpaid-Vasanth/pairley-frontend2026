import { useEffect, useState } from 'react';
import { Activity, Database, HardDrive, ExternalLink, RefreshCw } from 'lucide-react';
import * as Sentry from '@sentry/react';
import { api } from '../../utils/api';
import './SystemHealthTile.css';

const POLL_INTERVAL_MS = 60000;

// Points at the user's own Sentry/uptime-monitor project dashboards once
// configured — falls back to each service's generic login page so the
// links always go somewhere useful even before that's set up.
const SENTRY_DASHBOARD_URL = import.meta.env.VITE_SENTRY_DASHBOARD_URL || 'https://sentry.io';
const UPTIME_DASHBOARD_URL = import.meta.env.VITE_UPTIME_DASHBOARD_URL || 'https://uptimerobot.com/dashboard';

const STATUS_LABEL = { ok: 'Operational', degraded: 'Degraded', down: 'Down' };

function StatusPill({ value }) {
  const status = value === 'ok' ? 'ok' : value === 'down' ? 'down' : 'degraded';
  return <span className={`health-pill health-pill-${status}`}>{STATUS_LABEL[status]}</span>;
}

export default function SystemHealthTile() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [sentryTestResult, setSentryTestResult] = useState(null);
  const [sentryTesting, setSentryTesting] = useState(false);

  // TEMPORARY — Module 7 frontend Sentry verification only. Mirrors the
  // backend's explicit capture+flush pattern (relying on the fire-and-forget
  // default lost events there). Remove this handler and the button below
  // once the test event is confirmed in the pairley-frontend Sentry project.
  const runSentryTest = async () => {
    setSentryTesting(true);
    setSentryTestResult(null);
    try {
      const eventId = Sentry.captureException(
        new Error('Module 7 frontend Sentry verification test — safe to ignore, this is intentional.'),
      );
      const flushed = await Sentry.flush(5000);
      setSentryTestResult({ eventId, flushed });
    } finally {
      setSentryTesting(false);
    }
  };

  const fetchHealth = () => {
    api.get('/admin/system-health')
      .then((data) => {
        setHealth(data);
        setError(false);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch system health:', err);
        setError(true);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="system-health-tile">
      <div className="system-health-header">
        <h3>
          <Activity size={16} />
          System Health
        </h3>
        <div className="system-health-header-actions">
          <button onClick={fetchHealth} title="Refresh" className="system-health-refresh">
            <RefreshCw size={13} className={loading ? 'spinning' : ''} />
          </button>
          {health && <StatusPill value={health.status} />}
        </div>
      </div>

      {error ? (
        <p className="system-health-error">Couldn't reach the health endpoint.</p>
      ) : (
        <div className="system-health-grid">
          <div className="system-health-row">
            <span><Database size={13} /> Database</span>
            {health ? <StatusPill value={health.checks.database} /> : <span className="health-pill">…</span>}
          </div>
          <div className="system-health-row">
            <span><HardDrive size={13} /> Storage</span>
            {health ? <StatusPill value={health.checks.storage} /> : <span className="health-pill">…</span>}
          </div>
          <div className="system-health-row">
            <span>Release</span>
            <span className="system-health-value">{health?.release?.slice(0, 7) || '—'}</span>
          </div>
        </div>
      )}

      <div className="system-health-links">
        <a href={SENTRY_DASHBOARD_URL} target="_blank" rel="noreferrer">
          Sentry <ExternalLink size={11} />
        </a>
        <a href={UPTIME_DASHBOARD_URL} target="_blank" rel="noreferrer">
          Uptime monitor <ExternalLink size={11} />
        </a>
      </div>

      {/* TEMPORARY — remove once the test event is confirmed in Sentry */}
      <div className="system-health-sentry-test">
        <button onClick={runSentryTest} disabled={sentryTesting} className="system-health-sentry-test-btn">
          {sentryTesting ? 'Sending…' : 'Send test Sentry event'}
        </button>
        {sentryTestResult && (
          <p className="system-health-sentry-test-result">
            eventId: <code>{sentryTestResult.eventId}</code> · flushed: {String(sentryTestResult.flushed)}
          </p>
        )}
      </div>
    </div>
  );
}
