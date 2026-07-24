import FeatureSection from "./FeatureSection";
import Header from "./Header";
import HeroSection from "./HeroSection";

export default function LandingPage() {
  return (
    <main id="main-content" className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <FeatureSection />
    </main>
  );
}
