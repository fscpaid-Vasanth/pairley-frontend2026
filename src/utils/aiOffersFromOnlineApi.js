import { api } from './api';

// AI Offers From Online (2026-08-09) — the Pairley Admin queue of offers
// exported from the standalone AI Offer Collector, each already carrying a
// human-approved banner. Mirrors offerPublisherApi.js's shape.
//
// Note there is no `approve` call: approval and publication are one admin
// action here (`publish`), which internally runs the existing Offer
// Publisher approve -> publish pipeline. Bulk selection uses
// `publishSelected`.
export const aiOffersFromOnlineApi = {
  list: (status) => api.get(`/admin/ai-offers-from-online${status ? `?status=${status}` : ''}`),
  get: (id) => api.get(`/admin/ai-offers-from-online/${id}`),
  searchBusinesses: (q) => api.get(`/admin/ai-offers-from-online/businesses/search?q=${encodeURIComponent(q)}`),
  matchBusiness: (id, businessId) => api.put(`/admin/ai-offers-from-online/${id}/match-business`, { businessId }),
  createMerchant: (id) => api.put(`/admin/ai-offers-from-online/${id}/create-merchant`),
  correct: (id, fields) => api.patch(`/admin/ai-offers-from-online/${id}`, fields),
  publish: (id) => api.post(`/admin/ai-offers-from-online/${id}/publish`),
  validateSelected: (ids) => api.post('/admin/ai-offers-from-online/validate-selected', { ids }),
  publishSelected: (ids) => api.post('/admin/ai-offers-from-online/publish-selected', { ids }),
  reject: (id, reason) => api.post(`/admin/ai-offers-from-online/${id}/reject`, { reason: reason || undefined }),
};
