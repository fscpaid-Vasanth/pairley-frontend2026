import './ErrorFallback.css';

export default function ErrorFallback() {
  return (
    <div className="error-fallback">
      <div className="error-fallback-card">
        <h1>Something went wrong</h1>
        <p>
          We've hit an unexpected error and the team has been notified.
          Reloading the page usually fixes it.
        </p>
        <button onClick={() => window.location.reload()}>Reload page</button>
      </div>
    </div>
  );
}
