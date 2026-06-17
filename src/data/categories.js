export const categories = [
  {
    id: 'shopping',
    name: 'Shopping',
    icon: '🛍️',
    color: '#06B6D4',
    gradient: 'linear-gradient(135deg, #06B6D4, #0891B2)',
    description: 'BOGO deals on electronics, clothing, accessories & more',
    dealCount: 156,
    mode: 'pair',
  },
  {
    id: 'tours',
    name: 'Tour Packages',
    icon: '✈️',
    color: '#F97316',
    gradient: 'linear-gradient(135deg, #F97316, #EA580C)',
    description: 'Group travel packages — more people, lower price',
    dealCount: 89,
    mode: 'group',
  },
  {
    id: 'dining',
    name: 'Dining & Food',
    icon: '🍕',
    color: '#EF4444',
    gradient: 'linear-gradient(135deg, #EF4444, #DC2626)',
    description: 'BOGO meals, group dinner deals & bulk food orders',
    dealCount: 234,
    mode: 'both',
  },
  {
    id: 'fitness',
    name: 'Fitness & Gym',
    icon: '💪',
    color: '#10B981',
    gradient: 'linear-gradient(135deg, #10B981, #059669)',
    description: 'Pair gym memberships, group fitness class discounts',
    dealCount: 67,
    mode: 'both',
  },
  {
    id: 'entertainment',
    name: 'Events & Entertainment',
    icon: '🎬',
    color: '#8B5CF6',
    gradient: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
    description: 'Movie pairs, concert groups, theme park deals',
    dealCount: 112,
    mode: 'both',
  },
  {
    id: 'education',
    name: 'Education & Courses',
    icon: '📚',
    color: '#3B82F6',
    gradient: 'linear-gradient(135deg, #3B82F6, #2563EB)',
    description: 'Group discounts on online courses & workshops',
    dealCount: 78,
    mode: 'group',
  },
  {
    id: 'beauty',
    name: 'Beauty & Spa',
    icon: '💆',
    color: '#EC4899',
    gradient: 'linear-gradient(135deg, #EC4899, #DB2777)',
    description: 'BOGO spa sessions, pair salon treatments',
    dealCount: 93,
    mode: 'pair',
  },
  {
    id: 'subscriptions',
    name: 'Subscriptions & OTT',
    icon: '📺',
    color: '#6366F1',
    gradient: 'linear-gradient(135deg, #6366F1, #4F46E5)',
    description: 'Share family plans, group software licenses',
    dealCount: 45,
    mode: 'group',
  },
  {
    id: 'adventure',
    name: 'Adventure & Sports',
    icon: '🏔️',
    color: '#14B8A6',
    gradient: 'linear-gradient(135deg, #14B8A6, #0D9488)',
    description: 'Trekking groups, scuba batches, sports equipment',
    dealCount: 56,
    mode: 'group',
  },
  {
    id: 'home-services',
    name: 'Home Services',
    icon: '🏠',
    color: '#F59E0B',
    gradient: 'linear-gradient(135deg, #F59E0B, #D97706)',
    description: 'Neighborhood group deals for home maintenance',
    dealCount: 34,
    mode: 'group',
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    icon: '🏥',
    color: '#22D3EE',
    gradient: 'linear-gradient(135deg, #22D3EE, #06B6D4)',
    description: 'Pair health checkups, group dental & wellness plans',
    dealCount: 42,
    mode: 'both',
  },
  {
    id: 'coworking',
    name: 'Co-Working & Stays',
    icon: '🏢',
    color: '#A78BFA',
    gradient: 'linear-gradient(135deg, #A78BFA, #8B5CF6)',
    description: 'Shared office spaces, co-living group rates',
    dealCount: 28,
    mode: 'group',
  },
];

export const getCategoryById = (id) => categories.find((cat) => cat.id === id);

export const getCategoryColor = (id) => {
  const cat = getCategoryById(id);
  return cat ? cat.color : '#06B6D4';
};

export const getCategoryIcon = (id) => {
  const cat = getCategoryById(id);
  return cat ? cat.icon : '🏷️';
};
