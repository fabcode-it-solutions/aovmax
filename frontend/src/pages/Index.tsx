import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import SystemSection from "@/components/SystemSection";
import ComparisonSection from "@/components/ComparisonSection";
import ProofSection from "@/components/ProofSection";
import DifferentSection from "@/components/DifferentSection";
import CTASection from "@/components/CTASection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <SystemSection />
      <ComparisonSection />
      <ProofSection />
      <DifferentSection />
      <CTASection />
      <FAQSection />
      <Footer />
    </div>
  );
};

export default Index;
