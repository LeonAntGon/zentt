import { Navbar } from "@/components/landing/Navbar";
import { AcmeHero } from "@/components/landing/AcmeHero";
import { IntegrationsMarquee } from "@/components/landing/IntegrationsMarquee";
import { ClientSitesSection } from "@/components/landing/ClientSitesSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import ServicePricingSection from "@/components/landing/ServicePricingSection";
import Footer from "@/components/landing/Footer";
import { FloatingWhatsApp } from "@/components/landing/FloatingWhatsApp";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white font-body text-slate-900">
      <GoogleAnalytics />
      <Navbar />
      <AcmeHero />
      <IntegrationsMarquee />
      <ClientSitesSection />
      <FeaturesSection />
      <TestimonialsSection />
      <ServicePricingSection />
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
