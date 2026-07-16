import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { toPng } from 'html-to-image';
import { ShieldCheck, Download, Share2 } from 'lucide-react';
import { getAvatarById } from '../../data/launchAvatars';
import { APP_URL } from '../../utils/constants';
import { useToast } from '../../context/ToastContext';

export default function LaunchPassCard({ member, compact = false }) {
  const cardRef = useRef(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const { showToast } = useToast();

  const avatar = getAvatarById(member?.avatarId);
  const referralLink = `${APP_URL}/launch?ref=${member?.referralCode || ''}`;
  const joinDate = member?.joinDate?.toDate ? member.joinDate.toDate() : new Date();

  useEffect(() => {
    QRCode.toDataURL(referralLink, { margin: 1, width: 128, color: { dark: '#0a001a' } })
      .then(setQrDataUrl)
      .catch(() => {});
  }, [referralLink]);

  const captureImage = async () => {
    if (!cardRef.current) return null;
    return toPng(cardRef.current, { pixelRatio: 2, cacheBust: true });
  };

  const handleSave = async () => {
    setBusy(true);
    try {
      const dataUrl = await captureImage();
      if (!dataUrl) return;
      const link = document.createElement('a');
      link.download = `pairley-launch-pass-${member?.passNumber || 'card'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Save pass failed:', err);
      showToast('Could not save the pass image. Please try again.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleShare = async () => {
    setBusy(true);
    try {
      const dataUrl = await captureImage();
      if (!dataUrl) return;
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'pairley-launch-pass.png', { type: 'image/png' });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'My Pairley Launch Pass',
          text: "I'm officially part of Pairley Launch Pass. Join me before the Diwali launch!",
        });
      } else {
        const link = document.createElement('a');
        link.download = 'pairley-launch-pass.png';
        link.href = dataUrl;
        link.click();
        showToast('Sharing isn\'t supported here — image downloaded instead.', 'info');
      }
    } catch (err) {
      if (err?.name !== 'AbortError') {
        console.error('Share pass failed:', err);
        showToast('Could not share the pass. Please try again.', 'error');
      }
    } finally {
      setBusy(false);
    }
  };

  if (!member) return null;

  return (
    <div>
      <div ref={cardRef} className="launch-pass-card">
        <div className="launch-pass-card__header">
          <div className="launch-pass-card__avatar" style={{ background: avatar.gradient }}>
            {avatar.emoji}
          </div>
          <span className="launch-pass-card__verified">
            <ShieldCheck size={12} /> Verified
          </span>
        </div>

        <div className="launch-pass-card__number">{member.passNumber}</div>
        <div className="launch-pass-card__name">{member.name}</div>
        <div className="launch-pass-card__meta">
          Bangalore Member · Joined {joinDate.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
        </div>

        <div className="launch-pass-card__footer">
          <div className="launch-pass-card__referral">
            Referral code<br />
            <strong>{member.referralCode}</strong>
          </div>
          {qrDataUrl && (
            <div className="launch-pass-card__qr">
              <img src={qrDataUrl} alt="Referral QR code" width={72} height={72} />
            </div>
          )}
        </div>
      </div>

      {!compact && (
        <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
          <button className="launch-btn launch-btn--primary" onClick={handleSave} disabled={busy} type="button">
            <Download size={16} /> Save to Phone
          </button>
          <button className="launch-btn launch-btn--outline" onClick={handleShare} disabled={busy} type="button">
            <Share2 size={16} /> Share as Image
          </button>
          <button className="launch-btn launch-btn--outline" disabled type="button" title="Coming soon">
            🍎 Apple Wallet · Soon
          </button>
          <button className="launch-btn launch-btn--outline" disabled type="button" title="Coming soon">
            🅖 Google Wallet · Soon
          </button>
        </div>
      )}
    </div>
  );
}
