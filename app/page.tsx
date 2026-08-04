import { Navbar } from "@/components/landing/Navbar";
import { AcmeHero } from "@/components/landing/AcmeHero";
// import { IntegrationsMarquee } from "@/components/landing/IntegrationsMarquee";
import FeaturesSection from "@/components/landing/FeaturesSection";
import PricingSection from "@/components/landing/PricingSection";
import Footer from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white font-body text-slate-900">
      <Navbar />
      <AcmeHero />
      {/* <IntegrationsMarquee /> */}
      <FeaturesSection />
      <PricingSection />
      <Footer />
    </div>
  );
}
