import { Link } from 'react-router-dom';
import './Launch.css';

/**
 * Shared shell for every Launch Pass screen: dark gradient background with
 * soft purple/green glow, a slim logo bar, and a centered content column.
 * Mirrors the visual language already used in LandingPage's dark sections.
 *
 * `fixed` locks the page to the viewport height (no page scroll) — used on
 * every pre-dashboard screen. The dashboard itself has too much content to
 * reasonably fit one screen, so it omits `fixed` and scrolls normally.
 */
export default function LaunchLayout({ children, showLogo = true, wide = false, fixed = false, headerRight = null }) {
  return (
    <div className={`launch-shell ${fixed ? 'launch-shell--fixed' : ''}`}>
      <div className="launch-shell__glow launch-shell__glow--purple" />
      <div className="launch-shell__glow launch-shell__glow--green" />
      {showLogo && (
        <div className="launch-shell__topbar">
          <span />
          <Link to="/" className="launch-shell__logo">
            <img src="/logo.svg" alt="Pairley" />
            <span>Pairley</span>
          </Link>
          <div className="launch-shell__topbar-right">{headerRight}</div>
        </div>
      )}
      <div className={`launch-shell__content ${wide ? 'launch-shell__content--wide' : ''}`}>
        {children}
      </div>
    </div>
  );
}
