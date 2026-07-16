import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import QRCode from 'qrcode';
import {
  Percent,
  Tag,
  MessageCircle,
  LayoutDashboard,
  BarChart3,
  Award,
  Users,
  QrCode,
  ArrowRight,
} from 'lucide-react';
import CountdownTimer from '../../components/CountdownTimer';
import { subscribeToGlobalCounters } from '../../utils/launchFirestore';
import { APP_URL, LAUNCH_DATE, formatNumber } from '../../utils/constants';

const BENEFITS = [
  { icon: Percent, title: 'Zero Onboarding Fee', desc: 'Join free — no setup cost, no hidden charges, ever.' },
  { icon: Tag, title: 'Unlimited Offers', desc: 'Publish as many deals as you want, whenever you want.' },
  { icon: MessageCircle, title: 'WhatsApp Leads', desc: 'Get interested customers sent straight to your WhatsApp.' },
  { icon: LayoutDashboard, title: 'Merchant Dashboard', desc: 'Manage offers, orders and customers in one place.' },
  { icon: BarChart3, title: 'Business Analytics', desc: 'Track views, walk-ins and footfall trends in real time.' },
  { icon: Award, title: 'Launch Merchant Badge', desc: "A founding-member badge for Bangalore's first merchants." },
  { icon: Users, title: 'Live Customer Counter', desc: 'Watch your future customer base grow before you even open.' },
  { icon: QrCode, title: 'QR Registration', desc: 'Scan, fill 5 fields, done — registered in under 2 minutes.' },
];

export default function WhyJoinBeforeDiwali() {
  const navigate = useNavigate();
  const [verifiedMembers, setVerifiedMembers] = useState(0);
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    const unsub = subscribeToGlobalCounters((c) => setVerifiedMembers(c.verifiedMembers || 0));
    return unsub;
  }, []);

  useEffect(() => {
    QRCode.toDataURL(`${APP_URL}/merchant/join?src=mall-qr`, { margin: 1, width: 180, color: { dark: '#0e041a' } })
      .then(setQrDataUrl)
      .catch(() => {});
  }, []);

  return (
    <section className="py-24 md:py-32 relative bg-[#0e041a] overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[50rem] h-[30rem] bg-brand-purple/15 rounded-full blur-[120px] z-0" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-green/10 border border-brand-green/25 text-brand-green text-xs font-bold uppercase tracking-widest mb-4">
            🪔 Diwali Launch Countdown
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
            Why Join Pairley{' '}
            <span className="bg-gradient-to-r from-brand-purple-light to-brand-green bg-clip-text text-transparent">
              Before Diwali?
            </span>
          </h2>
          <p className="text-white/60 text-lg mb-6">
            Bangalore's earliest merchants get the biggest advantage — first pick of a growing customer base, for free.
          </p>
          <div className="inline-flex">
            <CountdownTimer endDate={LAUNCH_DATE} label="Diwali Launch" />
          </div>
        </div>

        {/* Live customer counter banner */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-14 p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl text-center"
        >
          <Users className="w-5 h-5 text-brand-green" />
          <span className="text-white font-bold text-lg">{formatNumber(verifiedMembers)} Bangaloreans</span>
          <span className="text-white/60 text-sm">have already joined the Launch Pass — waiting to discover businesses like yours.</span>
        </motion.div>

        {/* 8-benefit grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          {BENEFITS.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-brand-purple/50 hover:shadow-glow-purple/20 transition-all text-left space-y-3"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-purple/30 to-brand-green/20 flex items-center justify-center">
                <Icon className="w-5 h-5 text-brand-green" />
              </div>
              <h3 className="text-white font-bold text-base">{title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>

        {/* QR registration */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto p-8 md:p-10 rounded-3xl bg-gradient-to-r from-brand-purple/15 to-brand-green/10 border border-white/10 backdrop-blur-xl flex flex-col md:flex-row items-center gap-8"
        >
          <div className="bg-white p-3 rounded-2xl shrink-0">
            {qrDataUrl && <img src={qrDataUrl} alt="Scan to register" width={140} height={140} />}
          </div>
          <div className="text-center md:text-left flex-1">
            <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-bold uppercase tracking-wider mb-3">
              Scan &amp; Register
            </span>
            <h3 className="text-2xl font-black text-white mb-2">Registration Takes Less Than 2 Minutes</h3>
            <p className="text-white/60 text-sm mb-5">
              Scan this QR with your phone, or tap below. Just your shop name, category and mobile number — no documents needed today.
            </p>
            <button
              onClick={() => navigate('/merchant/join')}
              className="group px-7 py-3.5 bg-gradient-to-r from-brand-purple to-brand-green hover:shadow-glow-purple text-white font-semibold rounded-2xl transition-all inline-flex items-center gap-2"
            >
              Register in 2 Minutes
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
