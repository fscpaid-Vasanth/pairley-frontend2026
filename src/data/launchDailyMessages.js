// Rotating daily badges/messages shown on the Launch Dashboard to give
// returning visitors a reason to check back before launch day. Indexed by
// days-since-epoch % length, so every member sees the same message on a
// given day (keeps it feeling "live" rather than random-per-user).
export const launchDailyMessages = [
  { badge: '🔥', text: 'Bangalore is heating up — new members joining every hour.' },
  { badge: '🎁', text: 'Refer a friend today and climb the leaderboard.' },
  { badge: '🛍️', text: 'More merchants signed on today — the deals are stacking up.' },
  { badge: '⚡', text: 'Almost at the next milestone — bring a friend to help unlock it.' },
  { badge: '🏆', text: 'Check the leaderboard — did you move up today?' },
  { badge: '🎉', text: 'Every new member brings Diwali rewards closer for everyone.' },
  { badge: '📍', text: 'We visited a new Whitefield merchant today — deals coming soon.' },
];

export const getTodaysMessage = () => {
  const dayIndex = Math.floor(Date.now() / 86400000);
  return launchDailyMessages[dayIndex % launchDailyMessages.length];
};
