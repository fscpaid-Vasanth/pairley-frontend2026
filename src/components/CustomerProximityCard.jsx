import React from 'react';
import { MapPin, Info, Users, Tag } from 'lucide-react';

export default function CustomerProximityCard({ 
  distance = '1.2 KM', 
  interestedIn = '6-Month Membership', 
  joinedCount = 3, 
  category = 'fitness' 
}) {
  const getCategoryTheme = (cat) => {
    const defaultTheme = { bg: 'rgba(78,43,196,0.1)', color: '#5B12D6', emoji: '🛍️' };
    const themes = {
      dining: { bg: 'rgba(239,68,68,0.1)', color: '#EF4444', emoji: '🍕' },
      beauty: { bg: 'rgba(236,72,153,0.1)', color: '#EC4899', emoji: '💇' },
      shopping: { bg: 'rgba(16,185,129,0.1)', color: '#22C55E', emoji: '🛍️' },
      fitness: { bg: 'rgba(59,130,246,0.1)', color: '#3B82F6', emoji: '🏋️' },
      tours: { bg: 'rgba(245,158,11,0.1)', color: '#F59E0B', emoji: '✈️' }
    };
    return themes[cat?.toLowerCase()] || defaultTheme;
  };

  const theme = getCategoryTheme(category);
  const initials = interestedIn ? interestedIn.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() : 'CU';

  return (
    <div style={{
      background: 'white',
      border: '1.5px solid rgba(78, 43, 196, 0.12)',
      borderRadius: '16px',
      padding: '16px',
      boxShadow: '0 4px 15px rgba(78, 43, 196, 0.02)',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      transition: 'all 0.2s ease',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative radial gradient glow */}
      <div style={{
        position: 'absolute',
        top: '-20px',
        right: '-20px',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${theme.bg} 0%, transparent 70%)`,
        pointerEvents: 'none'
      }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Initials Circle */}
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: theme.bg,
          color: theme.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: '14px',
          flexShrink: 0
        }}>
          {initials}
        </div>

        {/* Distance & Info */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontWeight: 800,
              color: '#5B12D6',
              background: 'rgba(78, 43, 196, 0.08)',
              padding: '2px 8px',
              borderRadius: '99px',
              border: '1px solid rgba(78, 43, 196, 0.12)'
            }}>
              <MapPin size={10} /> {distance} away
            </span>
            <span style={{ fontSize: '12px' }}>{theme.emoji}</span>
          </div>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e1b4b', marginTop: '2px' }}>
            {interestedIn}
          </span>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        paddingTop: '10px',
        borderTop: '1px solid rgba(0, 0, 0, 0.04)',
        fontSize: '11px',
        color: '#64748b',
        fontWeight: 600
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Users size={12} color="#5B12D6" />
          {joinedCount} groups joined
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Tag size={12} color="#22C55E" />
          {category}
        </span>
      </div>

      {/* Privacy disclaimer */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '9px',
        color: '#94a3b8',
        fontStyle: 'italic',
        marginTop: '-2px'
      }}>
        <Info size={9} />
        Exact location not shared · privacy protected
      </div>
    </div>
  );
}

