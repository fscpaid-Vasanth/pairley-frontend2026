/**
 * Calculates merchant profile completeness purely from the business profile
 * object already returned by GET /business/profile — no backend field, no
 * extra request. Recompute this on the frontend whenever the profile changes.
 */
const CHECKPOINTS = [
  { key: 'business_name', label: 'Business name', check: (b) => !!b.business_name?.trim() },
  { key: 'category', label: 'Category', check: (b) => !!b.category?.trim() },
  { key: 'description', label: 'Description', check: (b) => !!b.description?.trim() },
  { key: 'address', label: 'Address', check: (b) => !!b.address?.trim() && !!b.city?.trim() },
  { key: 'location', label: 'Precise location', check: (b) => typeof b.geo_lat === 'number' && typeof b.geo_lng === 'number' },
  { key: 'logo', label: 'Logo', check: (b) => !!b.logo },
  { key: 'cover_image', label: 'Cover image', check: (b) => !!b.cover_image },
  { key: 'gallery', label: 'Gallery photos', check: (b) => Array.isArray(b.gallery_images) && b.gallery_images.length > 0 },
  { key: 'store_timing', label: 'Store hours', check: (b) => !!b.store_timing && Object.keys(b.store_timing).length > 0 },
  { key: 'social', label: 'Website or social link', check: (b) => !!(b.website?.trim() || b.instagram?.trim() || b.facebook?.trim()) },
  { key: 'contact', label: 'WhatsApp or support number', check: (b) => !!(b.whatsapp?.trim() || b.support_number?.trim()) },
  { key: 'gst', label: 'GST number', check: (b) => !!b.gst_number?.trim() },
];

export function calculateProfileCompletion(business) {
  if (!business) return { percent: 0, completed: [], missing: CHECKPOINTS.map((c) => c.label) };

  const completed = [];
  const missing = [];
  for (const cp of CHECKPOINTS) {
    (cp.check(business) ? completed : missing).push(cp.label);
  }

  return {
    percent: Math.round((completed.length / CHECKPOINTS.length) * 100),
    completed,
    missing,
  };
}
