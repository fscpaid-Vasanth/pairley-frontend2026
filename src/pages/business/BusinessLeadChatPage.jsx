import { useParams, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import LeadChatThread from '../../components/LeadChatThread';
import BusinessNav from '../../components/BusinessNav';
import './BusinessLeadChatPage.css';

/**
 * Module 13 Phase 2 — the merchant side of the Deal Coordination Assistant
 * ("Chat with Your Offer Partner"), reached from the Leads page.
 * `offerName` comes through router state when available; direct
 * navigation still works without it.
 */
export default function BusinessLeadChatPage() {
  const { leadId } = useParams();
  const location = useLocation();
  const { offerName } = location.state || {};

  return (
    <div className="page-wrapper py-6 text-left business-lead-chat-page">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="mb-4 flex items-center gap-3">
          <Link
            to="/business/leads"
            className="p-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition shadow-sm"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
              Chat with Your Offer Partner
            </h3>
            <span className="text-[11px] font-bold text-slate-400">
              {offerName || 'Interested-customer conversation'}
            </span>
          </div>
        </div>

        <BusinessNav />

        <div className="business-lead-chat-page__hint">
          <ShieldCheck size={13} />
          This customer's identity stays private here even after you unlock their contact details on the Leads page — this thread never shows names.
        </div>

        <div className="business-lead-chat-page__thread">
          <LeadChatThread leadId={leadId} viewerRole="BUSINESS" />
        </div>
      </div>
    </div>
  );
}
