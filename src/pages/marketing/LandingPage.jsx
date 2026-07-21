import { useEffect } from 'react';
import {
  User,
  Search,
  Heart,
  TrendingDown,
  MessageCircle,
  ShoppingBag,
  Store,
  Tag,
  Users,
  TrendingUp,
} from 'lucide-react';
import MarketingNav from '../../components/marketing/MarketingNav';
import HeroSection from '../../components/marketing/HeroSection';
import ComparisonCards from '../../components/marketing/ComparisonCards';
import HowItWorksSection from '../../components/marketing/HowItWorksSection';
import CustomerBenefitsSection from '../../components/marketing/CustomerBenefitsSection';
import MerchantBenefitsSection from '../../components/marketing/MerchantBenefitsSection';
import WhyDifferentSection from '../../components/marketing/WhyDifferentSection';
import JourneyTimeline from '../../components/marketing/JourneyTimeline';
import ScreenshotShowcase from '../../components/marketing/ScreenshotShowcase';
import FaqAccordion from '../../components/marketing/FaqAccordion';
import LaunchPassStrip from '../../components/marketing/LaunchPassStrip';
import FinalCtaBanner from '../../components/marketing/FinalCtaBanner';
import MarketingFooter from '../../components/marketing/MarketingFooter';

const CUSTOMER_JOURNEY_STEPS = [
  { icon: User, label: 'Customer' },
  { icon: Search, label: 'Browse' },
  { icon: Heart, label: 'Show Interest' },
  { icon: TrendingDown, label: 'Price Drops' },
  { icon: MessageCircle, label: 'Merchant Contacts' },
  { icon: ShoppingBag, label: 'Purchase' },
];

const MERCHANT_JOURNEY_STEPS = [
  { icon: Store, label: 'Merchant' },
  { icon: Tag, label: 'Create Offer' },
  { icon: Users, label: 'Interested Customers' },
  { icon: MessageCircle, label: 'WhatsApp Notification' },
  { icon: ShoppingBag, label: 'Sale' },
  { icon: TrendingUp, label: 'Business Growth' },
];

export default function LandingPage() {
  useEffect(() => {
    document.title = "Pairley — India's Hyperlocal Group Buying Platform";
  }, []);

  return (
    <div className="min-h-screen bg-ink">
      <MarketingNav />
      <HeroSection />
      <ComparisonCards />
      <HowItWorksSection />
      <CustomerBenefitsSection />
      <MerchantBenefitsSection />
      <WhyDifferentSection />
      <JourneyTimeline
        id="customer-journey"
        title="The Customer Journey"
        tagline="From browsing to buying, in six simple steps."
        steps={CUSTOMER_JOURNEY_STEPS}
        accent="purple"
      />
      <JourneyTimeline
        id="merchant-journey"
        title="The Merchant Journey"
        tagline="From your first offer to real business growth."
        steps={MERCHANT_JOURNEY_STEPS}
        accent="green"
      />
      <ScreenshotShowcase />
      <FaqAccordion />
      <LaunchPassStrip />
      <FinalCtaBanner />
      <MarketingFooter />
    </div>
  );
}
