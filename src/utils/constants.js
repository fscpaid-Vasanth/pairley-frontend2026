// Route paths
export const ROUTES = {
  HOME: '/',
  DEALS: '/deals',
  DEAL_DETAIL: '/deals/:id',
  HOW_IT_WORKS: '/how-it-works',
  ABOUT: '/about',
  SUPPORT: '/support',
  REFUND_POLICY: '/refund-policy',
  PRIVACY_POLICY: '/privacy-policy',

  // Cart & Checkout
  CART: '/cart',
  CHECKOUT: '/checkout',
  ORDER_SUCCESS: '/order-success/:id',

  // Auth
  SIGNUP: '/signup',
  LOGIN: '/login',

  // Customer
  CUSTOMER_DASHBOARD: '/customer/dashboard',
  CUSTOMER_PROFILE: '/customer/profile',
  CUSTOMER_ORDERS: '/customer/orders',
  CUSTOMER_ORDER_DETAIL: '/customer/orders/:id',
  CUSTOMER_CHAT: '/customer/chat/:id',
  CUSTOMER_DEAL_CHAT: '/customer/deal-chat/:dealId',

  // Business
  BUSINESS_DASHBOARD: '/business/dashboard',
  CREATE_DEAL: '/business/create-deal',
  EDIT_DEAL: '/business/edit-deal/:id',
  MANAGE_DEALS: '/business/manage-deals',
  BUSINESS_ORDERS: '/business/orders',
  BUSINESS_LEADS: '/business/leads',
  BUSINESS_PAYOUTS: '/business/payouts',
  BUSINESS_SETTINGS: '/business/settings',

  // Admin
  ADMIN_DASHBOARD: '/admin/dashboard',

  // Launch Pass (pre-launch campaign)
  LAUNCH: '/launch',
  LAUNCH_REGISTER: '/launch/register',
  LAUNCH_PASS: '/launch/pass',
  LAUNCH_DASHBOARD: '/launch/dashboard',
  MERCHANT_JOIN: '/merchant/join',
};

// Diwali 2026 launch date — target for the Launch Pass countdown.
export const LAUNCH_DATE = '2026-11-08T00:00:00+05:30';

// App info
export const APP_NAME = 'Pairley';
export const APP_TAGLINE = 'Buy Together. Save Together.';
export const APP_DESCRIPTION =
  "Pairley is India's smart local group-buying marketplace where customers discover exclusive offers from restaurants, gyms, salons, retail stores and local businesses. Join deals together and save more.";
export const APP_URL = 'https://www.pairley.com';
export const APP_OG_IMAGE = 'https://www.pairley.com/og-image.png';

// Deal modes
export const DEAL_MODES = {
  PAIR: 'pair',
  GROUP: 'group',
};

// Deal statuses
export const DEAL_STATUS = {
  ACTIVE: 'active',
  DRAFT: 'draft',
  PAIRED: 'paired',
  COMPLETE: 'complete',
  EXPIRED: 'expired',
};

// Interest statuses
export const INTEREST_STATUS = {
  SEARCHING: 'searching',
  WAITING: 'waiting',
  PAIRED: 'paired',
  GROUPED: 'grouped',
};

// Stats for homepage
export const PLATFORM_STATS = {
  totalDeals: 1034,
  happyPairs: 5280,
  groupsFormed: 892,
  moneySaved: 2450000, // in rupees
};

// Social links
export const SOCIAL_LINKS = {
  instagram: 'https://instagram.com/pairley',
  twitter: 'https://twitter.com/pairley',
  youtube: 'https://youtube.com/@pairley',
  linkedin: 'https://linkedin.com/company/pairley',
};

// Utility functions
export const formatPrice = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatNumber = (num) => {
  if (num >= 10000000) return `${(num / 10000000).toFixed(1)}Cr`;
  if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

export const getTimeGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

export const calculateSavings = (originalPrice, pairleyPrice) => {
  const saved = originalPrice - pairleyPrice;
  const percentage = Math.round((saved / originalPrice) * 100);
  return { saved, percentage };
};

export const getDaysRemaining = (dateString) => {
  const now = new Date();
  const target = new Date(dateString);
  const diff = target - now;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

export const MALLS = [
  'Orion Mall, Rajajinagar',
  'Phoenix Marketcity, Whitefield',
  'Forum Koramangala Mall',
  'UB City, Vittal Mallya Road',
  'Mantri Square Mall, Malleshwaram',
  'Nexus Shantiniketan, Whitefield',
  'Royal Meenakshi Mall, Bannerghatta Road',
  'Vega City Mall, Bannerghatta Road',
  'Gopalan Signature Mall, Old Madras Road'
];
