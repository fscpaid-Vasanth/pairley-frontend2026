import { useEffect, useState } from 'react';
import { MessageCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { api } from '../../utils/api';

/**
 * Module 8 — WhatsApp Business API lead alerts. Self-contained (fetches
 * and mutates its own state via dedicated endpoints) rather than folded
 * into BusinessSettingsPage's big form-save flow, since setting a number
 * triggers an immediate OTP send — it can't wait for a "Save Changes" click.
 */
export default function WhatsappLeadAlertsCard() {
  const { showToast } = useToast();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [numberInput, setNumberInput] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const fetchStatus = () => {
    api.get('/business/whatsapp-status')
      .then((data) => {
        setStatus(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load WhatsApp status:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleSetNumber = () => {
    if (!numberInput.trim()) return;
    setSaving(true);
    api.put('/business/whatsapp-number', { number: numberInput.trim() })
      .then((data) => {
        setStatus((prev) => ({ ...prev, ...data }));
        setNumberInput('');
        showToast(
          data.otpSent
            ? 'Verification code sent via WhatsApp. Enter it below.'
            : 'Number saved, but the code could not be sent — check the number and try again.',
          data.otpSent ? 'success' : 'error',
        );
      })
      .catch((err) => showToast(err.message || 'Failed to update WhatsApp number.', 'error'))
      .finally(() => setSaving(false));
  };

  const handleResetToDefault = () => {
    setSaving(true);
    api.put('/business/whatsapp-number', { number: '' })
      .then((data) => {
        setStatus((prev) => ({ ...prev, ...data }));
        showToast('Reverted to your registered mobile number.', 'success');
      })
      .catch((err) => showToast(err.message || 'Failed to reset WhatsApp number.', 'error'))
      .finally(() => setSaving(false));
  };

  const handleVerify = () => {
    if (!codeInput.trim()) return;
    setVerifying(true);
    api.post('/business/whatsapp-number/verify', { code: codeInput.trim() })
      .then((data) => {
        setStatus((prev) => ({ ...prev, ...data }));
        setCodeInput('');
        showToast('WhatsApp number verified!', 'success');
      })
      .catch((err) => showToast(err.message || 'Invalid or expired code.', 'error'))
      .finally(() => setVerifying(false));
  };

  return (
    <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col gap-4">
      <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-2 flex items-center gap-1.5">
        <MessageCircle size={16} className="text-[#5B12D6]" />
        WhatsApp Lead Alerts
      </h4>

      {loading ? (
        <p className="text-xs text-slate-400 font-semibold">Loading…</p>
      ) : (
        <>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <span>Currently sending lead alerts to:</span>
            <span className="text-slate-800 font-bold">{status?.number}</span>
            {status?.verified ? (
              <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase">
                <CheckCircle2 size={11} /> Verified
              </span>
            ) : (
              <span className="text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase">
                Pending verification
              </span>
            )}
            {status?.isDefault && (
              <span className="text-slate-400 text-[10px]">(your registered mobile)</span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-600">Use a different WhatsApp number</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={numberInput}
                  onChange={(e) => setNumberInput(e.target.value)}
                  placeholder="9876543210"
                  className="flex-1 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-[#5B12D6]"
                />
                <button
                  type="button"
                  onClick={handleSetNumber}
                  disabled={saving || !numberInput.trim()}
                  className="px-4 py-2 bg-[#5B12D6] hover:bg-[#430bb0] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all whitespace-nowrap"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : 'Send Code'}
                </button>
              </div>
              {!status?.isDefault && (
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  disabled={saving}
                  className="text-[#5B12D6] hover:underline text-[11px] font-bold text-left mt-0.5"
                >
                  Reset to registered mobile
                </button>
              )}
            </div>

            {!status?.verified && !status?.isDefault && (
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-600">Enter verification code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value)}
                    placeholder="6-digit code"
                    maxLength={6}
                    className="flex-1 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-[#5B12D6]"
                  />
                  <button
                    type="button"
                    onClick={handleVerify}
                    disabled={verifying || !codeInput.trim()}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all whitespace-nowrap"
                  >
                    {verifying ? <Loader2 size={14} className="animate-spin" /> : 'Verify'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
