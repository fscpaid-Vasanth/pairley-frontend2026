import { useParams, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import LeadChatThread from '../../components/LeadChatThread';
import './CustomerLeadChatPage.css';

/**
 * Module 13 — the customer side of the anonymous 1:1 lead chat, reached
 * from InterestButton's confirmation card after Show Interest, or directly
 * via a notification deep link. `offerName`/`shopName` come through
 * router state when available (DealDetailPage has them already loaded);
 * arriving without state (e.g. a bare deep link) still works — the header
 * just falls back to generic copy since this page doesn't have its own
 * lead-detail endpoint to call.
 */
export default function CustomerLeadChatPage() {
  const { leadId } = useParams();
  const location = useLocation();
  const { offerName, shopName } = location.state || {};

  return (
    <div className="page-wrapper py-6 text-left customer-lead-chat-page">
      <div className="container max-w-3xl mx-auto px-4">
        <div className="mb-4 flex items-center gap-3">
          <Link
            to="/customer/dashboard"
            className="p-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition shadow-sm"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
              Anonymous Chat with Merchant
            </h3>
            <span className="text-[11px] font-bold text-slate-400">
              {offerName ? `${offerName}${shopName ? ` · ${shopName}` : ''}` : 'Your interest conversation'}
            </span>
          </div>
        </div>

        <div className="customer-lead-chat-page__hint">
          <ShieldCheck size={13} />
          Your name and contact details are never shared here — the merchant sees you only as "Customer" until they unlock your details from their dashboard.
        </div>

        <div className="customer-lead-chat-page__thread">
          <LeadChatThread leadId={leadId} viewerRole="CUSTOMER" />
        </div>
      </div>
    </div>
  );
}
