// Shared by ClaimRequestsPanel (the list) and ClaimDetailModal (Module 12
// Phase 3) so both render the exact same status pill. Split out of
// ClaimRequestsPanel.jsx to avoid a circular import between the two files.
export const STATUS_STYLES = {
  PENDING_ADMIN_REVIEW: 'bg-orange-50 border-orange-200 text-orange-700 animate-pulse',
  ADMIN_APPROVED: 'bg-indigo-50 border-indigo-200 text-[#5B12D6]',
  ADMIN_REJECTED: 'bg-rose-50 border-rose-200 text-rose-700',
  COMPLETED: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  EXPIRED: 'bg-slate-100 border-slate-200 text-slate-500',
};
