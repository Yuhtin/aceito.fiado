// src/app/page.tsx
import { HeroV3 } from "@/components/marketing/hero-v3";
import { ManifestoStrip } from "@/components/marketing/manifesto-strip";
import { NumbersGrid } from "@/components/marketing/numbers-grid";

export default function HomePage() {
  return (
    <div className="af-screen">
      <HeroV3 />
      <ManifestoStrip />
      <NumbersGrid />
    </div>
  );
}
