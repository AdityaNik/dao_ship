
import React from "react";
import Navigation from "@/components/navigation";
import HeroSection from "@/components/hero-section";
import FeaturesSection from "@/components/features-section";
import HowItWorksSection from "@/components/how-it-works-section";
import BenefitsSection from "@/components/benefits-section";
import EcosystemSection from "@/components/ecosystem-section";
import TestimonialsSection from "@/components/testimonials-section";
import CtaSection from "@/components/cta-section";
import Footer from "@/components/footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-background">
      <Navigation />
      <main className="pt-16">
        <HeroSection />
        <FeaturesSection />
        <BenefitsSection />
        <HowItWorksSection />
        <EcosystemSection />
        <TestimonialsSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
