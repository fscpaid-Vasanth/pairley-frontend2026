import { useParams, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Users } from 'lucide-react';
import GroupChatThread from '../../components/GroupChatThread';
import './CustomerGroupChatPage.css';

/**
 * Anonymous Customer-to-Customer Offer Group Chat — reached from
 * DealDetailPage's "Enter Group Chat" card after Show Interest, or
 * directly via a GROUP_MEMBER_JOINED notification deep link.
 * `offerName`/`shopName` come through router state when available;
 * arriving without state (e.g. a bare deep link) still works — the
 * header just falls back to generic copy.
 */
export default function CustomerGroupChatPage() {
  const { offerId } = useParams();
  const location = useLocation();
  const { offerName, shopName } = location.state || {};

  return (
    <div className="page-wrapper py-6 text-left customer-group-chat-page">
      <div className="container max-w-3xl mx-auto px-4">
        <div className="mb-4 flex items-center gap-3">
          <Link
            to={`/deals/${offerId}`}
            className="p-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition shadow-sm"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
              <Users size={18} className="text-[#5B12D6]" />
              {offerName || 'Group Chat'}
            </h3>
            <span className="text-[11px] font-bold text-slate-400">
              {shopName ? `${shopName} · ` : ''}Anonymous Pairley Chat
            </span>
          </div>
        </div>

        <div className="customer-group-chat-page__hint">
          <ShieldCheck size={13} />
          You're chatting with other Pairley members interested in this offer — never the merchant, and never your real identity.
        </div>

        <div className="customer-group-chat-page__thread">
          <GroupChatThread offerId={offerId} />
        </div>
      </div>
    </div>
  );
}
