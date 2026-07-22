import { useNavigate } from 'react-router-dom';
import { Mail, Phone } from 'lucide-react';
import LogoMark from './LogoMark';

// Inline brand glyphs — this lucide build doesn't export Facebook/YouTube,
// so all four socials use solid brand marks for a consistent look.
const BRAND_PATHS = {
  Instagram:
    'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
  LinkedIn:
    'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z',
  Facebook:
    'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
  YouTube:
    'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
};

function BrandIcon({ name, size = 17 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d={BRAND_PATHS[name]} />
    </svg>
  );
}

const QUICK_LINKS = [
  { label: 'Home', id: 'top' },
  { label: 'Explore Deals', to: '/deals' },
  { label: 'For Customers', id: 'customer-benefits' },
  { label: 'For Merchants', id: 'merchant-benefits' },
  { label: 'FAQ', id: 'faq' },
];

const SOCIALS = [
  { label: 'Instagram', name: 'Instagram', href: 'https://instagram.com' },
  { label: 'LinkedIn', name: 'LinkedIn', href: 'https://linkedin.com' },
  { label: 'Facebook', name: 'Facebook', href: 'https://facebook.com' },
  { label: 'YouTube', name: 'YouTube', href: 'https://youtube.com' },
];

export default function SiteFooter() {
  const navigate = useNavigate();

  const go = (link) => {
    if (link.to) return navigate(link.to);
    if (link.id === 'top') return window.scrollTo({ top: 0, behavior: 'smooth' });
    document.getElementById(link.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <footer id="contact" className="relative bg-pairley-ink text-white scroll-mt-24">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-16 pb-8">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1.2fr]">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2">
              <LogoMark className="w-9 h-9" />
              <span className="text-xl font-black tracking-tight font-outfit">PAIRLEY</span>
            </div>
            <p className="mt-4 text-[15px] text-white/60 font-inter leading-relaxed max-w-sm">
              India's smart local deals marketplace. The more we join, the more we unlock.
            </p>
            <div className="mt-6 flex items-center gap-2.5">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-10 h-10 rounded-xl bg-white/8 hover:bg-pairley-purple flex items-center justify-center transition-colors"
                >
                  <BrandIcon name={s.name} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-[12px] font-bold uppercase tracking-[0.18em] text-white/40 mb-4">Quick Links</h3>
            <ul className="flex flex-col gap-3">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <button onClick={() => go(link)} className="text-[15px] text-white/70 hover:text-white transition-colors font-inter">
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Support / contact */}
          <div>
            <h3 className="text-[12px] font-bold uppercase tracking-[0.18em] text-white/40 mb-4">Support</h3>
            <ul className="flex flex-col gap-4">
              <li>
                <a href="mailto:Support@Pairley.com" className="flex items-center gap-3 text-white/70 hover:text-white transition-colors">
                  <span className="w-10 h-10 rounded-xl bg-white/8 flex items-center justify-center shrink-0">
                    <Mail size={17} />
                  </span>
                  <span className="text-[15px] font-inter">Support@Pairley.com</span>
                </a>
              </li>
              <li>
                <a href="tel:+918610855337" className="flex items-center gap-3 text-white/70 hover:text-white transition-colors">
                  <span className="w-10 h-10 rounded-xl bg-white/8 flex items-center justify-center shrink-0">
                    <Phone size={17} />
                  </span>
                  <span className="text-[15px] font-inter">+91 86108 55337</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[13px] text-white/40 font-inter">© 2026 Pairley. All Rights Reserved.</p>
          <p className="text-[13px] text-white/40 font-inter">Made in India 🇮🇳 for local businesses</p>
        </div>
      </div>
    </footer>
  );
}
