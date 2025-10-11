import CTASection from "@/components/CTASection";
import FeaturesSection from "@/components/FeaturesSection";
import HeroSection from "@/components/HeroSection";

export default function HomePage() {
  return (
      <div className="w-full overflow-x-hidden">
        <HeroSection />
        <FeaturesSection />
        <CTASection />
      </div>
  )
}
