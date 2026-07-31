// Offer Publisher — the image-first, single-offer admin publishing flow
// that replaced spreadsheet bulk-import. JSON endpoints go through the
// shared `api` helper; the three multipart endpoints (image drafts, a ZIP
// of images, one draft's gallery) go through the shared postMultipart
// helper — same convention bulkImportApi.js established, now lifted into
// api.js itself so this doesn't need a third near-identical copy.
import { api, postMultipart } from './api';

export const offerPublisherApi = {
  createDraftsFromFiles: (files) => {
    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append('files', f));
    return postMultipart('/admin/offer-publisher/drafts', formData);
  },

  createDraftsFromZip: (zipFile) => {
    const formData = new FormData();
    formData.append('file', zipFile);
    return postMultipart('/admin/offer-publisher/drafts/zip', formData);
  },

  listDrafts: (ids) => api.get(`/admin/offer-publisher/drafts?ids=${ids.join(',')}`),
  getDraft: (id) => api.get(`/admin/offer-publisher/drafts/${id}`),
  updateDraft: (id, fields) => api.patch(`/admin/offer-publisher/drafts/${id}`, fields),

  addGalleryImages: (id, files) => {
    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append('files', f));
    return postMultipart(`/admin/offer-publisher/drafts/${id}/gallery`, formData);
  },
  removeGalleryImage: (id, url) =>
    api.delete(`/admin/offer-publisher/drafts/${id}/gallery?url=${encodeURIComponent(url)}`),

  deleteDraft: (id) => api.delete(`/admin/offer-publisher/drafts/${id}`),
  approve: (id) => api.post(`/admin/offer-publisher/drafts/${id}/approve`, {}),
  reject: (id, reason) => api.post(`/admin/offer-publisher/drafts/${id}/reject`, { reason }),
  publish: (id) => api.post(`/admin/offer-publisher/drafts/${id}/publish`, {}),

  searchBusinesses: (q) => api.get(`/admin/offer-publisher/businesses/search?q=${encodeURIComponent(q)}`),
};
