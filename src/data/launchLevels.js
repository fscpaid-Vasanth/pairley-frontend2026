// Referral levels for the Launch Pass. Points are earned via
// LAUNCH_POINTS below and drive the level shown on the pass/dashboard.
export const launchLevels = [
  { id: 'explorer', label: 'Explorer', minPoints: 0 },
  { id: 'saver', label: 'Saver', minPoints: 50 },
  { id: 'insider', label: 'Insider', minPoints: 150 },
  { id: 'champion', label: 'Champion', minPoints: 400 },
  { id: 'legend', label: 'Legend', minPoints: 1000 },
];

export const LAUNCH_POINTS = {
  JOIN_BONUS: 25,
  REFERRAL_BONUS: 25,
  DAILY_VISIT_BONUS: 5,
};

export const getLevelForPoints = (points) => {
  let current = launchLevels[0];
  launchLevels.forEach((lvl) => {
    if (points >= lvl.minPoints) current = lvl;
  });
  return current;
};

export const getNextLevel = (points) => {
  return launchLevels.find((lvl) => points < lvl.minPoints) || null;
};
