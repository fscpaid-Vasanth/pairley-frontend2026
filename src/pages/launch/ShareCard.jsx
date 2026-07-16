import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { Download } from 'lucide-react';
import { getAvatarById } from '../../data/launchAvatars';
import { getLevelForPoints } from '../../data/launchLevels';
import { APP_URL, formatNumber } from '../../utils/constants';
import { useToast } from '../../context/ToastContext';

const CAPTION =
  "I'm officially part of Pairley Launch Pass.\n\nBangalore's biggest local shopping movement starts this Diwali.\n\nJoin me and unlock bigger rewards together.";

export default function ShareCard({ member, verifiedMembers }) {
  const cardRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const { showToast } = useToast();

  const avatar = getAvatarById(member.avatarId);
  const level = getLevelForPoints(member.points || 0);
  const referralLink = `${APP_URL}/launch?ref=${member.referralCode}`;
  const encodedText = encodeURIComponent(CAPTION + '\n\n' + referralLink);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setBusy(true);
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2, cacheBust: true });
      const link = document.createElement('a');
      link.download = 'pairley-launch-share.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error(err);
      showToast('Could not generate the share image.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Pairley Launch Pass', text: CAPTION, url: referralLink });
      } catch {
        /* user cancelled */
      }
    } else {
      navigator.clipboard?.writeText(referralLink);
      showToast('Referral link copied to clipboard.', 'success');
    }
  };

  return (
    <div>
      <div ref={cardRef} className="launch-pass-card" style={{ padding: 24 }}>
        <div className="launch-pass-card__header">
          <div className="launch-pass-card__avatar" style={{ background: avatar.gradient, width: 52, height: 52, fontSize: 24 }}>
            {avatar.emoji}
          </div>
          <span className="launch-pass-card__verified">{level.label}</span>
        </div>
        <div className="launch-pass-card__number">{member.passNumber}</div>
        <div className="launch-pass-card__name" style={{ fontSize: 18 }}>{member.name}</div>
        <div className="launch-pass-card__meta">
          {formatNumber(verifiedMembers)} Bangaloreans have already joined the movement
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
        <button className="launch-btn launch-btn--outline" onClick={handleDownload} disabled={busy} type="button">
          <Download size={15} /> Download
        </button>
        <a className="launch-btn launch-btn--outline" href={`https://wa.me/?text=${encodedText}`} target="_blank" rel="noreferrer">
          WhatsApp
        </a>
        <a className="launch-btn launch-btn--outline" href={`https://twitter.com/intent/tweet?text=${encodedText}`} target="_blank" rel="noreferrer">
          X
        </a>
        <a
          className="launch-btn launch-btn--outline"
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`}
          target="_blank"
          rel="noreferrer"
        >
          Facebook
        </a>
        <a
          className="launch-btn launch-btn--outline"
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`}
          target="_blank"
          rel="noreferrer"
        >
          LinkedIn
        </a>
        <button className="launch-btn launch-btn--primary" onClick={handleNativeShare} type="button">
          Invite Friends
        </button>
      </div>
    </div>
  );
}
