// src/app/page.tsx
import { ApiSection } from "@/components/marketing/api-section";
import { CtaFinal } from "@/components/marketing/cta-final";
import { FooterV3 } from "@/components/marketing/footer-v3";
import { HeroV3 } from "@/components/marketing/hero-v3";
import { HowItWorksV3 } from "@/components/marketing/how-it-works-v3";
import { ManifestoStrip } from "@/components/marketing/manifesto-strip";
import { NumbersGrid } from "@/components/marketing/numbers-grid";
import { TestimonialV3 } from "@/components/marketing/testimonial-v3";

export default function HomePage() {
  return (
    <div className="af-screen">
      <HeroV3 />
      <ManifestoStrip />
      <NumbersGrid />
      <HowItWorksV3 />
      <ApiSection />
      <TestimonialV3 />
      <CtaFinal />
      <FooterV3 />
    </div>
  );
}
