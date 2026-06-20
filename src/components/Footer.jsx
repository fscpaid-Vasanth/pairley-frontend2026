import { Link } from 'react-router-dom';
import { Mail, Send } from 'lucide-react';
import { ROUTES, SOCIAL_LINKS, APP_DESCRIPTION } from '../utils/constants';
import { categories } from '../data/categories';
import './Footer.css';

/* Only show the top 6 categories by deal count */
const topCategories = [...categories]
  .sort((a, b) => b.dealCount - a.dealCount)
  .slice(0, 6);

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__grid">
          {/* Column 1 — Brand */}
          <div>
            <div className="footer__brand-logo">
              <img src="/logo.svg" alt="Pairley Logo" className="footer__logo-img" />
            </div>
            <p className="footer__brand-tagline">Pair Up. Pay Less. Get More.</p>
            <p className="footer__brand-desc">{APP_DESCRIPTION}</p>
          </div>

          {/* Column 2 — Quick Links */}
          <div>
            <h4 className="footer__col-title">Quick Links</h4>
            <div className="footer__links">
              <Link to={ROUTES.HOME} className="footer__link">Home</Link>
              <Link to={ROUTES.DEALS} className="footer__link">Deals</Link>
              <Link to={ROUTES.HOW_IT_WORKS} className="footer__link">How It Works</Link>
              <Link to={ROUTES.ABOUT} className="footer__link">About</Link>
              <Link to={ROUTES.SIGNUP} className="footer__link">Sign Up</Link>
              <Link to={ROUTES.LOGIN} className="footer__link">Log In</Link>
            </div>
          </div>

          {/* Column 3 — Categories */}
          <div>
            <h4 className="footer__col-title">Categories</h4>
            <div className="footer__links">
              {topCategories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`${ROUTES.DEALS}?category=${cat.id}`}
                  className="footer__link"
                >
                  {cat.icon} {cat.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Column 4 — Connect */}
          <div>
            <h4 className="footer__col-title">Connect</h4>

            <div className="footer__socials">
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="footer__social-link"
                aria-label="Instagram"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a
                href={SOCIAL_LINKS.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="footer__social-link"
                aria-label="Twitter"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
              </a>
              <a
                href={SOCIAL_LINKS.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="footer__social-link"
                aria-label="YouTube"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
              </a>
              <a
                href={SOCIAL_LINKS.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="footer__social-link"
                aria-label="LinkedIn"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </a>
            </div>

            <p className="footer__newsletter-label">
              <Mail size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 6 }} />
              Stay updated with the latest deals
            </p>
            <form
              className="footer__newsletter-form"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                className="footer__newsletter-input"
                placeholder="your@email.com"
                aria-label="Email address"
              />
              <button
                type="submit"
                className="footer__newsletter-btn"
                aria-label="Subscribe"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer__bottom">
          <p className="footer__copyright">© 2026 Pairley. All rights reserved.</p>
          <div className="footer__legal">
            <Link to={ROUTES.SUPPORT} className="footer__legal-link">Help & Support</Link>
            <Link to={ROUTES.REFUND_POLICY} className="footer__legal-link">Refund Policy</Link>
            <Link to="/terms" className="footer__legal-link">Terms of Service</Link>
            <Link to="/privacy" className="footer__legal-link">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
