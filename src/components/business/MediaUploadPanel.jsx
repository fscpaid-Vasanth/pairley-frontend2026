import { useRef, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { API_URL } from '../../utils/api';
import './MediaUploadPanel.css';

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('pairley_token') || ''}` });

/**
 * Shared media upload UI — single-image slots (e.g. logo/cover) plus an
 * optional gallery grid. Used by both BusinessSettingsPage (Module 2) and
 * offer create/edit (Module 3) so the upload interaction pattern only
 * exists once. The caller owns the actual endpoint URLs and response
 * shape; this component only owns file selection, previews, and the
 * upload/remove request lifecycle.
 *
 * `singleSlots`: [{ key, label, value, uploadUrl, responseField }]
 * `gallery`: { images, uploadUrl, removeUrl, responseField, maxCount } | null
 * `onUpdated(partialResponse)`: called with the server response after any
 *   successful upload/remove, so the parent can merge it into its own state.
 */
export default function MediaUploadPanel({ singleSlots = [], gallery = null, onUpdated, onError }) {
  const [uploadingKey, setUploadingKey] = useState(null);
  const fileInputRefs = useRef({});

  const doUpload = async (uploadUrl, formData, key) => {
    setUploadingKey(key);
    try {
      const res = await fetch(`${API_URL}${uploadUrl}`, {
        method: 'POST',
        headers: authHeaders(),
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Upload failed');
      }
      const data = await res.json();
      onUpdated?.(data);
    } catch (err) {
      onError?.(err.message || 'Failed to upload image.');
    } finally {
      setUploadingKey(null);
    }
  };

  const handleSingleSlotSelect = (slot, files) => {
    if (!files?.[0]) return;
    const formData = new FormData();
    formData.append(slot.responseField, files[0]);
    doUpload(slot.uploadUrl, formData, slot.key);
  };

  const handleGallerySelect = (files) => {
    if (!files?.length) return;
    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append(gallery.responseField, f));
    doUpload(gallery.uploadUrl, formData, 'gallery');
  };

  const handleRemoveGalleryImage = async (url) => {
    try {
      const res = await fetch(`${API_URL}${gallery.removeUrl}?url=${encodeURIComponent(url)}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error('Failed to remove image');
      const data = await res.json();
      onUpdated?.(data);
    } catch (err) {
      onError?.(err.message || 'Failed to remove image.');
    }
  };

  return (
    <div className="media-upload-panel">
      {singleSlots.length > 0 && (
        <div className="media-upload-panel__slots">
          {singleSlots.map((slot) => (
            <div className="flex flex-col gap-1.5" key={slot.key}>
              <label className="text-xs font-semibold text-slate-600">{slot.label}</label>
              <div
                className="media-upload-box"
                onClick={() => fileInputRefs.current[slot.key]?.click()}
              >
                {slot.value ? (
                  <img src={slot.value} alt={slot.label} className="media-upload-preview" />
                ) : (
                  <span className="text-xs text-slate-400">Click to upload {slot.label.toLowerCase()}</span>
                )}
                {uploadingKey === slot.key && (
                  <div className="media-upload-overlay"><Loader2 className="animate-spin" size={20} /></div>
                )}
              </div>
              <input
                ref={(el) => (fileInputRefs.current[slot.key] = el)}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => handleSingleSlotSelect(slot, e.target.files)}
              />
            </div>
          ))}
        </div>
      )}

      {gallery && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-600">
            Gallery ({gallery.images.length}/{gallery.maxCount})
          </label>
          <div className="gallery-grid">
            {gallery.images.map((img) => (
              <div key={img} className="gallery-thumb">
                <img src={img} alt="Gallery item" />
                <button type="button" className="gallery-thumb-remove" onClick={() => handleRemoveGalleryImage(img)}>
                  <X size={12} />
                </button>
              </div>
            ))}
            {gallery.images.length < gallery.maxCount && (
              <div className="gallery-thumb gallery-thumb-add" onClick={() => fileInputRefs.current.gallery?.click()}>
                {uploadingKey === 'gallery' ? <Loader2 className="animate-spin" size={18} /> : <span className="text-2xl text-slate-300">+</span>}
              </div>
            )}
          </div>
          <input
            ref={(el) => (fileInputRefs.current.gallery = el)}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => handleGallerySelect(e.target.files)}
          />
        </div>
      )}
    </div>
  );
}
