// Launch Pass avatar options. Simple emoji-based avatars for Phase 1 — no
// custom illustration artwork commissioned yet (see plan notes). Swappable
// later from the Launch Dashboard without touching the schema.
export const launchAvatars = [
  { id: 'professional', label: 'Professional', emoji: '💼', gradient: 'linear-gradient(135deg, #6D28D9, #4C1D95)' },
  { id: 'student', label: 'Student', emoji: '🎒', gradient: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' },
  { id: 'food-lover', label: 'Food Lover', emoji: '🍜', gradient: 'linear-gradient(135deg, #EF4444, #B91C1C)' },
  { id: 'fitness', label: 'Fitness Enthusiast', emoji: '🏋️', gradient: 'linear-gradient(135deg, #22C55E, #15803D)' },
  { id: 'traveller', label: 'Traveller', emoji: '🧳', gradient: 'linear-gradient(135deg, #F97316, #C2410C)' },
  { id: 'shopper', label: 'Shopper', emoji: '🛍️', gradient: 'linear-gradient(135deg, #EC4899, #BE185D)' },
  { id: 'family', label: 'Family', emoji: '👨‍👩‍👧', gradient: 'linear-gradient(135deg, #14B8A6, #0F766E)' },
  { id: 'minimal', label: 'Minimal Abstract', emoji: '◆', gradient: 'linear-gradient(135deg, #64748B, #334155)' },
  { id: 'cartoon', label: 'Modern Cartoon', emoji: '🦸', gradient: 'linear-gradient(135deg, #A78BFA, #7C3AED)' },
];

export const getAvatarById = (id) => launchAvatars.find((a) => a.id === id) || launchAvatars[0];
