import { useNavigate } from 'react-router-dom';
import { ROUTES, SOCIAL_LINKS } from '../../utils/constants';
import LogoMark from './LogoMark';

const LINKS = [
  { label: 'For Customers', href: '/customer' },
  { label: 'For Merchants', href: '/merchant' },
  { label: 'How It Works', href: ROUTES.HOW_IT_WORKS },
  { label: 'About', href: ROUTES.ABOUT },
  { label: 'Help & Support', href: ROUTES.SUPPORT },
  { label: 'Privacy Policy', href: ROUTES.PRIVACY_POLICY },
];

const SOCIALS = [
  { label: 'Instagram', href: SOCIAL_LINKS.instagram },
  { label: 'Twitter', href: SOCIAL_LINKS.twitter },
  { label: 'LinkedIn', href: SOCIAL_LINKS.linkedin },
];

export default function MarketingFooter() {
  const navigate = useNavigate();

  return (
    <footer className="bg-ink border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex flex-col items-center gap-6 text-center">
          <button onClick={() => navigate('/')} className="flex items-center gap-2">
            <LogoMark className="w-9 h-9" />
            <span className="text-xl font-black text-white">Pairley</span>
          </button>

          <p className="text-sm text-white/40 max-w-sm">
            India's hyperlocal group-buying platform — connecting customers and
            local businesses for mutual growth.
          </p>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {LINKS.map((link) => (
              <button
                key={link.label}
                onClick={() => navigate(link.href)}
                className="text-sm font-medium text-white/50 hover:text-white transition-colors"
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="flex gap-4">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="text-white/40 hover:text-brand-purple-light transition-colors text-xs font-semibold"
              >
                {s.label}
              </a>
            ))}
          </div>

          <div className="w-full h-px bg-white/10" />

          <p className="text-xs text-white/30">© 2026 Pairley. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
