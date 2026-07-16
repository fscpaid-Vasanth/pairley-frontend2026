// Community milestone tiers for the Launch Pass "Ring 2" reward unlocks.
// Category ids reference the real taxonomy in src/data/categories.js so the
// unlocked chips are the actual categories that'll go live at launch.
export const launchMilestones = [
  {
    threshold: 10000,
    label: '10K',
    icon: '☕',
    title: 'Cafés & Desserts Unlocked',
    categoryIds: ['dining'],
  },
  {
    threshold: 25000,
    label: '25K',
    icon: '💇',
    title: 'Salons, Gyms & Movies Unlocked',
    categoryIds: ['beauty', 'fitness', 'entertainment'],
  },
  {
    threshold: 50000,
    label: '50K',
    icon: '🛍️',
    title: 'Shopping & Fashion Unlocked',
    categoryIds: ['shopping'],
  },
  {
    threshold: 75000,
    label: '75K',
    icon: '✈️',
    title: 'Travel & Lifestyle Unlocked',
    categoryIds: ['tours', 'coworking'],
  },
  {
    threshold: 100000,
    label: '100K',
    icon: '👑',
    title: 'Mega Diwali Rewards Unlocked',
    categoryIds: [],
    special: true,
  },
];

export const getCurrentMilestoneIndex = (count) => {
  let idx = -1;
  launchMilestones.forEach((m, i) => {
    if (count >= m.threshold) idx = i;
  });
  return idx;
};

export const getNextMilestone = (count) => {
  return launchMilestones.find((m) => count < m.threshold) || null;
};
