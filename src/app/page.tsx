import StarField from "@/components/StarField";
import HeroSection from "@/components/HeroSection";
import FeatureSection from "@/components/FeatureSection";
import ServiceSection from "@/components/ServiceSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="relative min-h-screen" style={{ background: "linear-gradient(180deg, #0a0510 0%, #1a0a2e 40%, #0d0820 100%)" }}>
      <StarField />
      {/* 배경 오브 */}
      <div className="orb w-96 h-96 top-0 left-1/4 opacity-20" style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }} />
      <div className="orb w-80 h-80 top-1/3 right-0 opacity-15" style={{ background: "radial-gradient(circle, #d4a853, transparent)" }} />
      <div className="orb w-64 h-64 bottom-1/4 left-0 opacity-20" style={{ background: "radial-gradient(circle, #5b21b6, transparent)" }} />

      <div className="relative z-10">
        <HeroSection />
        <FeatureSection />
        <ServiceSection />
        <CTASection />
        <Footer />
      </div>
    </main>
  );
}
