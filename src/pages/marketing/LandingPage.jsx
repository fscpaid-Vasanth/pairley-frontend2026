import { useEffect } from 'react';
import LandingAmbient from '../../components/marketing/LandingAmbient';
import LandingNav from '../../components/marketing/LandingNav';
import HeroSection from '../../components/marketing/HeroSection';
import TrustBar from '../../components/marketing/TrustBar';
import WhyPairley from '../../components/marketing/WhyPairley';
import HowItWorks from '../../components/marketing/HowItWorks';
import PriceDiscovery from '../../components/marketing/PriceDiscovery';
import MerchantDashboardPreview from '../../components/marketing/MerchantDashboardPreview';
import BenefitsSplit from '../../components/marketing/BenefitsSplit';
import LiveOffers from '../../components/marketing/LiveOffers';
import LaunchPassSection from '../../components/marketing/LaunchPassSection';
import StatsBand from '../../components/marketing/StatsBand';
import Testimonials from '../../components/marketing/Testimonials';
import FaqAccordion from '../../components/marketing/FaqAccordion';
import FinalCta from '../../components/marketing/FinalCta';
import SiteFooter from '../../components/marketing/SiteFooter';

// Pairley public landing page — light/white "investor-ready" redesign
// (2026-07). Section order: hero (group-deal explainer) → trust → why →
// how → price discovery → merchant dashboard → benefits → live offers →
// launch pass (real /launch flow preview) → stats → testimonials → FAQ →
// CTA → footer.
export default function LandingPage() {
  useEffect(() => {
    document.title = "Pairley — Discover Better Local Deals Together";
  }, []);

  return (
    <div className="relative min-h-screen font-inter text-pairley-ink antialiased">
      <LandingAmbient />
      <LandingNav />
      <main>
        <HeroSection />
        <TrustBar />
        <WhyPairley />
        <HowItWorks />
        <PriceDiscovery />
        <MerchantDashboardPreview />
        <BenefitsSplit />
        <LiveOffers />
        <LaunchPassSection />
        <StatsBand />
        <Testimonials />
        <FaqAccordion />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  );
}
