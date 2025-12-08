import Navbar from '@/components/layout/Navbar';
import HeroSection from '@/components/home/HeroSection';
import PlanComparison from '@/components/home/PlanComparison';
import PlanFinderQuiz from '@/components/home/PlanFinderQuiz';
import FeaturesGrid from '@/components/home/FeaturesGrid';
import DomainSearch from '@/components/home/DomainSearch';
import OneClickInstalls from '@/components/home/OneClickInstalls';
import SecuritySection from '@/components/home/SecuritySection';
import TechStackSection from '@/components/home/TechStackSection';
import DataCentersSection from '@/components/home/DataCentersSection';
import SponsorsSection from '@/components/home/SponsorsSection';
import TrustSection from '@/components/home/TrustSection';
import CTASection from '@/components/home/CTASection';
import Footer from '@/components/layout/Footer';
import LiveChat from '@/components/home/LiveChat';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <SponsorsSection />
        <PlanComparison />
        <PlanFinderQuiz />
        <FeaturesGrid />
        <SecuritySection />
        <TechStackSection />
        <DomainSearch />
        <OneClickInstalls />
        <DataCentersSection />
        <TrustSection />
        <CTASection />
      </main>
      <Footer />
      <LiveChat />
    </div>
  );
};

export default Index;
