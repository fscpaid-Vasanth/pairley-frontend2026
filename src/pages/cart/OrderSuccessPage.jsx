import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Share2, Clipboard, MessageCircle, ArrowRight, Tag, Users } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import './OrderSuccessPage.css';

export default function OrderSuccessPage() {
  const { id: orderId } = useParams();
  const { showToast } = useToast();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://pairley.com/deals/match-invite-buds-fe`);
    showToast('Match invite link copied to clipboard! Share it to find a pair.', 'success');
  };

  // Matchmaking process tracking timeline config
  const matchingSteps = [
    { label: 'Interest Shared', desc: 'Lead details shared with the merchant', status: 'done' },
    { label: 'Searching for Partner', desc: 'Matching with a BOGO split partner', status: 'active' },
    { label: 'Match Secured & Finalized', desc: 'Merchant contacts co-buyers directly', status: 'pending' },
    { label: 'Offline Sale Fulfilled', desc: 'Direct BOGO delivery and checkout complete', status: 'pending' },
  ];

  return (
    <div className="order-success-page page-wrapper py-10 flex items-center justify-center min-h-[80vh]">
      <div className="container max-w-2xl mx-auto px-4 text-center flex flex-col items-center gap-6">
        
        {/* Animated Check Orb */}
        <div className="order-success-page__visual relative w-24 h-24 mb-2 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-emerald-500/10 border border-emerald-500/20 animate-ping"></div>
          <div className="absolute inset-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 animate-pulse"></div>
          <div className="absolute inset-4 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/20">
            <Check size={36} strokeWidth={3} />
          </div>
        </div>

        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800">Interest Registered! 🎉</h2>
          <p className="text-sm text-slate-500 mt-2">
            Your contact details have been shared with the shop owner. Order reference: <span className="font-extrabold text-slate-700">{orderId}</span>
          </p>
        </div>

        {/* Matchmaking visual timeline */}
        <div className="bg-white border border-slate-200 p-6 rounded-3xl w-full text-left shadow-sm">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
            <Users size={14} /> Matchmaking Tracker
          </h4>

          <div className="flex flex-col gap-5 relative pl-6 border-l border-slate-100 ml-3">
            {matchingSteps.map((s, idx) => {
              const isDone = s.status === 'done';
              const isActive = s.status === 'active';

              return (
                <div key={idx} className="relative flex flex-col gap-1">
                  {/* Step bullet dot */}
                  <span className={`absolute -left-[30px] top-1 w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center text-[8px] font-bold ${
                    isDone ? 'bg-emerald-600 border-emerald-600 text-white' : 
                    isActive ? 'bg-amber-500 border-amber-500 text-white animate-pulse' : 'bg-white border-slate-200 text-slate-400'
                  }`}>
                    {isDone ? <Check size={8} strokeWidth={3} /> : idx + 1}
                  </span>

                  <span className={`text-xs font-bold ${isDone ? 'text-slate-800' : isActive ? 'text-amber-600' : 'text-slate-400'}`}>
                    {s.label}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">{s.desc}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sharing boost card */}
        <div className="bg-[#4E2BC4]/5 border border-[#4E2BC4]/10 p-5 rounded-3xl w-full text-left flex flex-col gap-4">
          <div>
            <h4 className="text-sm font-bold text-[#4E2BC4] flex items-center gap-1.5">
              <Share2 size={16} />
              Boost Your Match Speed!
            </h4>
            <p className="text-[11px] text-indigo-950/80 leading-relaxed mt-1 font-semibold">
              Sharing this listing with friends or social feeds lets you find a split BOGO partner up to 3x faster.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleCopyLink}
              className="flex-1 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition"
            >
              <Clipboard size={14} /> Copy Invite Link
            </button>
            
            <a
              href={`https://api.whatsapp.com/send?text=Hey! Join me on Pairley to split this BOGO deal! https://pairley.com/deals/match-invite-buds-fe`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-[#25D366] hover:bg-[#20BA5A] text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition"
            >
              <MessageCircle size={14} /> WhatsApp Share
            </a>

            <a
              href={`https://twitter.com/intent/tweet?text=Looking for a split partner to match this deal on Pairley!`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-[#1DA1F2] hover:bg-[#1A91DA] text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="inline-block"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg> Twitter Tweet
            </a>
          </div>
        </div>

        {/* Page redirects */}
        <div className="flex flex-col sm:flex-row gap-3 w-full justify-center mt-2">
          <Link to="/deals" className="btn btn-primary bg-[#4E2BC4] hover:bg-[#3D1FB3] text-white font-extrabold px-6 py-3 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/10 transition">
            <Tag size={16} /> Continue Browsing
          </Link>
          <Link to="/customer/dashboard" className="btn btn-outline border-slate-200 hover:bg-slate-50 text-slate-700 font-bold px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all">
            Track Match Progress <ArrowRight size={14} />
          </Link>
        </div>

      </div>
    </div>
  );
}
