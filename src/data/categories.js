export const categories = [
  {
    id: 'shopping',
    name: 'Shopping',
    icon: '🛍️',
    imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=80&auto=format&fit=crop&q=60',
    color: '#06B6D4',
    gradient: 'linear-gradient(135deg, #06B6D4, #0891B2)',
    description: 'BOGO deals on electronics, clothing, accessories & more',
    mode: 'pair',
  },
  {
    id: 'tours',
    name: 'Tour Packages',
    icon: '✈️',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=80&auto=format&fit=crop&q=60',
    color: '#F97316',
    gradient: 'linear-gradient(135deg, #F97316, #EA580C)',
    description: 'Group travel packages — more people, lower price',
    mode: 'group',
  },
  {
    id: 'dining',
    name: 'Dining & Food',
    icon: '🍕',
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=80&auto=format&fit=crop&q=60',
    color: '#EF4444',
    gradient: 'linear-gradient(135deg, #EF4444, #DC2626)',
    description: 'BOGO meals, group dinner deals & bulk food orders',
    mode: 'both',
  },
  {
    id: 'fitness',
    name: 'Fitness & Gym',
    icon: '💪',
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=80&auto=format&fit=crop&q=60',
    color: '#22C55E',
    gradient: 'linear-gradient(135deg, #22C55E, #16A34A)',
    description: 'Pair gym memberships, group fitness class discounts',
    mode: 'both',
  },
  {
    id: 'entertainment',
    name: 'Events & Entertainment',
    icon: '🎬',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=80&auto=format&fit=crop&q=60',
    color: '#8B5CF6',
    gradient: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
    description: 'Movie pairs, concert groups, theme park deals',
    mode: 'both',
  },
  {
    id: 'education',
    name: 'Education & Courses',
    icon: '📚',
    imageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=80&auto=format&fit=crop&q=60',
    color: '#3B82F6',
    gradient: 'linear-gradient(135deg, #3B82F6, #2563EB)',
    description: 'Group discounts on online courses & workshops',
    mode: 'group',
  },
  {
    id: 'beauty',
    name: 'Beauty & Spa',
    icon: '💆',
    imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=80&auto=format&fit=crop&q=60',
    color: '#EC4899',
    gradient: 'linear-gradient(135deg, #EC4899, #DB2777)',
    description: 'BOGO spa sessions, pair salon treatments',
    mode: 'pair',
  },
  {
    id: 'subscriptions',
    name: 'Subscriptions & OTT',
    icon: '📺',
    imageUrl: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=80&auto=format&fit=crop&q=60',
    color: '#6366F1',
    gradient: 'linear-gradient(135deg, #6366F1, #4F46E5)',
    description: 'Share family plans, group software licenses',
    mode: 'group',
  },
  {
    id: 'adventure',
    name: 'Adventure & Sports',
    icon: '🏔️',
    imageUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=80&auto=format&fit=crop&q=60',
    color: '#14B8A6',
    gradient: 'linear-gradient(135deg, #14B8A6, #0D9488)',
    description: 'Trekking groups, scuba batches, sports equipment',
    mode: 'group',
  },
  {
    id: 'home-services',
    name: 'Home Services',
    icon: '🏠',
    imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=80&auto=format&fit=crop&q=60',
    color: '#F59E0B',
    gradient: 'linear-gradient(135deg, #F59E0B, #D97706)',
    description: 'Neighborhood group deals for home maintenance',
    mode: 'group',
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    icon: '🏥',
    imageUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=80&auto=format&fit=crop&q=60',
    color: '#22D3EE',
    gradient: 'linear-gradient(135deg, #22D3EE, #06B6D4)',
    description: 'Pair health checkups, group dental & wellness plans',
    mode: 'both',
  },
  {
    id: 'coworking',
    name: 'Co-Working & Stays',
    icon: '🏢',
    imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=80&auto=format&fit=crop&q=60',
    color: '#A78BFA',
    gradient: 'linear-gradient(135deg, #A78BFA, #8B5CF6)',
    description: 'Shared office spaces, co-living group rates',
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

export const getCategoryImageUrl = (id) => {
  const cat = getCategoryById(id);
  return cat ? cat.imageUrl : 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=80&auto=format&fit=crop&q=60';
};
