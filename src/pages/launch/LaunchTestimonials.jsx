import { customerTestimonials } from '../../data/testimonials';

/**
 * Renders nothing until real customer quotes exist in
 * src/data/testimonials.js — see that file for why. Drop real entries in
 * and this activates automatically; no other changes needed.
 */
export default function LaunchTestimonials() {
  if (!customerTestimonials.length) return null;

  return (
    <div className="launch-section">
      <div className="launch-section__title">💬 What Early Members Are Saying</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginTop: 14 }}>
        {customerTestimonials.map(({ name, role, quote, photoUrl }) => (
          <div key={name} className="launch-glass" style={{ padding: 18, textAlign: 'left' }}>
            <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.8)', fontStyle: 'italic', margin: '0 0 14px' }}>
              &ldquo;{quote}&rdquo;
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {photoUrl ? (
                <img src={photoUrl} alt={name} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6D28D9, #22C55E)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700, color: '#fff',
                }}>
                  {name.charAt(0)}
                </div>
              )}
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{name}</div>
                <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.5)' }}>{role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
