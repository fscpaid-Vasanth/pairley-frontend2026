import { useEffect } from 'react';
import {
  Search,
  Heart,
  Bell,
  Wallet,
  UserPlus,
  Tag,
  Users,
  Phone,
  TrendingUp,
} from 'lucide-react';
import MarketingNav from '../../components/marketing/MarketingNav';
import HeroSection from '../../components/marketing/HeroSection';
import ComparisonCards from '../../components/marketing/ComparisonCards';
import HowItWorksSection from '../../components/marketing/HowItWorksSection';
import CustomerBenefitsSection from '../../components/marketing/CustomerBenefitsSection';
import MerchantBenefitsSection from '../../components/marketing/MerchantBenefitsSection';
import ComparisonTable from '../../components/marketing/ComparisonTable';
import JourneyTimeline from '../../components/marketing/JourneyTimeline';
import ScreenshotShowcase from '../../components/marketing/ScreenshotShowcase';
import FaqAccordion from '../../components/marketing/FaqAccordion';
import LaunchPassStrip from '../../components/marketing/LaunchPassStrip';
import FinalCtaBanner from '../../components/marketing/FinalCtaBanner';
import MarketingFooter from '../../components/marketing/MarketingFooter';

const CUSTOMER_JOURNEY_STEPS = [
  { icon: Search, label: 'Discover' },
  { icon: Heart, label: 'Show Interest' },
  { icon: Bell, label: 'Merchant Notified' },
  { icon: Tag, label: 'Purchase' },
  { icon: Wallet, label: 'Save Money' },
];

const MERCHANT_JOURNEY_STEPS = [
  { icon: UserPlus, label: 'Register' },
  { icon: Tag, label: 'Create Offer' },
  { icon: Users, label: 'Receive Interested Customers' },
  { icon: Phone, label: 'Contact Customer' },
  { icon: TrendingUp, label: 'Grow Business' },
];

export default function LandingPage() {
  useEffect(() => {
    document.title = "Pairley — India's Hyperlocal Group Buying Platform";
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <MarketingNav />
      <HeroSection />
      <ComparisonCards />
      <HowItWorksSection />
      <CustomerBenefitsSection />
      <MerchantBenefitsSection />
      <ComparisonTable />
      <JourneyTimeline
        id="customer-journey"
        title="The Customer Journey"
        tagline="From discovery to savings, in five simple steps."
        steps={CUSTOMER_JOURNEY_STEPS}
        accent="purple"
      />
      <JourneyTimeline
        id="merchant-journey"
        title="The Merchant Journey"
        tagline="From registration to real business growth."
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
