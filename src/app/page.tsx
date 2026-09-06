import { Hero } from "@/components/home/Hero";
import { Experience } from "@/components/home/Experience";
import { Wildlife } from "@/components/home/Wildlife";
import { Schedule } from "@/components/home/Schedule";
import { Gallery } from "@/components/home/Gallery";
import { Testimonials } from "@/components/home/Testimonials";
import { Faq } from "@/components/home/Faq";
import { Cta } from "@/components/home/Cta";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <Experience />
      <Wildlife />
      <Schedule />
      <Gallery />
      <Testimonials />
      <Faq />
      <Cta />
    </>
  );
}

function TrustStrip() {
  const items = ["Coast Guard licensed captain", "Small groups of 12", "Binoculars & vests included", "Free cancellation 24h", "Rain or shine, 7 days a week"];
  return (
    <div className="border-y border-ink/10 bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-5 py-5 text-sm font-semibold text-ink-soft sm:px-8">
        {items.map((t) => (
          <span key={t} className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-coral" />
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
