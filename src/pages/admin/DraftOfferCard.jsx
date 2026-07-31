import { useState } from 'react';
import { Save, Trash2, ImageOff } from 'lucide-react';
import MediaUploadPanel from '../../components/business/MediaUploadPanel';
import { getDocumentPreviewUrl } from '../../utils/adminFilePreview';
import { offerPublisherApi } from '../../utils/offerPublisherApi';
import { useToast } from '../../context/ToastContext';
import { categories } from '../../data/categories';

const STATUS_STYLES = {
  DRAFT: 'bg-slate-100 text-slate-600 border-slate-200',
  APPROVED: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  REJECTED: 'bg-rose-50 text-rose-600 border-rose-200',
  ACTIVE: 'bg-blue-50 text-blue-600 border-blue-200',
};

const toDateInput = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  'w-full text-xs rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5B12D6]/30 focus:border-[#5B12D6]';

/**
 * One draft offer's editable form — Step 2 of the Offer Publisher wizard.
 * The uploaded image is already the offer's cover_image by the time this
 * renders (Step 1 creates the draft with it attached), so this only ever
 * needs the gallery slot from MediaUploadPanel, not the single cover slot.
 */
export default function DraftOfferCard({ draft, onUpdated, onDelete }) {
  const { showToast } = useToast();
  const [form, setForm] = useState({
    merchantName: draft.merchant.merchantName === 'Untitled Merchant' ? '' : draft.merchant.merchantName,
    mobile: draft.merchant.mobile || '',
    whatsapp: draft.merchant.whatsapp || '',
    email: draft.merchant.email || '',
    city: draft.merchant.city || '',
    area: draft.merchant.area || '',
    address: draft.merchant.address || '',
    state: draft.merchant.state || '',
    pincode: draft.merchant.pincode || '',
    googleMapsLink: draft.merchant.googleMapsLink || '',
    category: draft.category || '',
    title: draft.title === 'Untitled offer' ? '' : draft.title,
    description: draft.description || '',
    originalPrice: draft.originalPrice || '',
    offerPrice: draft.offerPrice || '',
    minParticipants: draft.minParticipants || 1,
    startDate: toDateInput(draft.startDate),
    endDate: toDateInput(draft.endDate),
    terms: draft.terms || '',
  });
  const [saving, setSaving] = useState(false);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    setSaving(true);
    offerPublisherApi
      .updateDraft(draft.id, {
        ...form,
        originalPrice: Number(form.originalPrice) || 0,
        offerPrice: Number(form.offerPrice) || 0,
        minParticipants: Number(form.minParticipants) || 1,
      })
      .then((updated) => {
        onUpdated(updated);
        showToast('Draft saved.', 'success');
      })
      .catch((err) => showToast(err.message || 'Failed to save draft.', 'error'))
      .finally(() => setSaving(false));
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/70 overflow-hidden">
      <div className="relative aspect-[16/9] bg-slate-100">
        {draft.coverImage ? (
          <img src={getDocumentPreviewUrl(draft.coverImage)} alt={form.title || 'Draft offer'} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-slate-300">
            <ImageOff size={22} />
            <span className="text-[10px] font-bold uppercase tracking-wide">No image</span>
          </div>
        )}
        <span
          className={`absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide border ${STATUS_STYLES[draft.status] || STATUS_STYLES.DRAFT}`}
        >
          {draft.status}
        </span>
        <button
          onClick={onDelete}
          title="Delete this draft"
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 hover:bg-rose-600 text-white grid place-items-center transition-colors"
        >
          <Trash2 size={13} />
        </button>
      </div>

      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Merchant Name">
            <input className={inputClass} value={form.merchantName} onChange={(e) => update('merchantName', e.target.value)} />
          </Field>
          <Field label="Contact Number">
            <input className={inputClass} value={form.mobile} onChange={(e) => update('mobile', e.target.value)} />
          </Field>
          <Field label="WhatsApp">
            <input className={inputClass} value={form.whatsapp} onChange={(e) => update('whatsapp', e.target.value)} />
          </Field>
          <Field label="Category">
            <select className={inputClass} value={form.category} onChange={(e) => update('category', e.target.value)}>
              <option value="">Select…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Offer Title">
          <input className={inputClass} value={form.title} onChange={(e) => update('title', e.target.value)} />
        </Field>
        <Field label="Offer Description">
          <textarea className={inputClass} rows={2} value={form.description} onChange={(e) => update('description', e.target.value)} />
        </Field>

        <div className="grid grid-cols-3 gap-3">
          <Field label="Original Price">
            <input type="number" className={inputClass} value={form.originalPrice} onChange={(e) => update('originalPrice', e.target.value)} />
          </Field>
          <Field label="Offer Price">
            <input type="number" className={inputClass} value={form.offerPrice} onChange={(e) => update('offerPrice', e.target.value)} />
          </Field>
          <Field label="Min Participants">
            <input type="number" min="1" className={inputClass} value={form.minParticipants} onChange={(e) => update('minParticipants', e.target.value)} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="City">
            <input className={inputClass} value={form.city} onChange={(e) => update('city', e.target.value)} />
          </Field>
          <Field label="Area">
            <input className={inputClass} value={form.area} onChange={(e) => update('area', e.target.value)} />
          </Field>
        </div>
        <Field label="Address">
          <input className={inputClass} value={form.address} onChange={(e) => update('address', e.target.value)} />
        </Field>
        <Field label="Google Maps Link">
          <input className={inputClass} value={form.googleMapsLink} onChange={(e) => update('googleMapsLink', e.target.value)} />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Valid From">
            <input type="date" className={inputClass} value={form.startDate} onChange={(e) => update('startDate', e.target.value)} />
          </Field>
          <Field label="Valid Until">
            <input type="date" className={inputClass} value={form.endDate} onChange={(e) => update('endDate', e.target.value)} />
          </Field>
        </div>

        <Field label="Terms & Conditions">
          <textarea className={inputClass} rows={2} value={form.terms} onChange={(e) => update('terms', e.target.value)} />
        </Field>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400 block mb-1.5">Gallery Images</span>
          <MediaUploadPanel
            gallery={{
              // Raw stored URLs, not proxied — MediaUploadPanel uses this
              // same value both to render the thumbnail (<img src>) AND as
              // the removal identity sent to the backend's ?url= param. A
              // proxied URL there would never match the raw one the server
              // actually stores, so removal would silently no-op. Correct
              // removal matters more than a broken thumbnail on a private
              // (S3) bucket — once Firebase is active these render directly
              // anyway, with no proxy needed.
              images: draft.galleryImages || [],
              uploadUrl: `/admin/offer-publisher/drafts/${draft.id}/gallery`,
              removeUrl: `/admin/offer-publisher/drafts/${draft.id}/gallery`,
              responseField: 'files',
              maxCount: 10,
            }}
            onUpdated={onUpdated}
            onError={(msg) => showToast(msg, 'error')}
          />
        </div>

        {draft.status === 'REJECTED' && draft.rejectionReason && (
          <div className="text-[11px] font-semibold text-rose-500 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
            Rejected: {draft.rejectionReason}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-[#5B12D6] text-white text-xs font-extrabold shadow-md shadow-[#5B12D6]/20 hover:bg-[#4a0fb0] transition-colors disabled:opacity-50"
        >
          <Save size={14} /> {saving ? 'Saving…' : 'Save Draft'}
        </button>
      </div>
    </div>
  );
}
