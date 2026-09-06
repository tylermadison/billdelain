import Image from "next/image";
import Link from "next/link";
import { business, pricing, formatMoney } from "@/lib/config";

export function Hero() {
  return (
    <section className="relative isolate min-h-[min(92svh,880px)] overflow-hidden bg-ink text-white">
      <Image
        src="/images/hero-sea-lions.jpg"
        alt="Two California sea lions sunning themselves on the rocks"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[50%_45%]"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/45 to-ink/10" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-ink/80 to-transparent" />

      <div className="relative mx-auto flex min-h-[min(92svh,880px)] max-w-7xl flex-col justify-center px-5 py-24 sm:px-8">
        <p className="eyebrow fade-up !text-gold">Daily boat tours · 7am to 5pm · 7 days a week</p>
        <h1 className="font-display fade-up fade-up-1 mt-4 max-w-3xl text-5xl font-semibold leading-[1.02] sm:text-6xl lg:text-7xl">
          Meet the harbor&apos;s <em className="italic text-gold">wildest</em> neighbors.
        </h1>
        <p className="fade-up fade-up-2 mt-6 max-w-xl text-lg leading-relaxed text-white/85 sm:text-xl">
          One hour on the water with a local guide, a dozen guests, and hundreds of seals and sea lions
          barking, sunbathing, and splashing just off the bow.
        </p>
        <div className="fade-up fade-up-3 mt-9 flex flex-wrap items-center gap-4">
          <Link href="/book" className="btn btn-coral !px-7 !py-4 !text-base">
            Book tickets from {formatMoney(pricing.child)}
          </Link>
          <Link href="/#experience" className="btn btn-ghost !px-7 !py-4 !text-base">
            See what to expect
          </Link>
        </div>
        <dl className="fade-up fade-up-3 mt-14 grid max-w-2xl grid-cols-2 gap-6 text-sm sm:grid-cols-4">
          {[
            ["10", "departures a day"],
            ["60", "minutes on the water"],
            ["12", "guests max per boat"],
            ["100%", "sightings, every season"],
          ].map(([n, label]) => (
            <div key={label} className="border-l-2 border-gold/70 pl-4">
              <dt className="font-display text-3xl font-semibold">{n}</dt>
              <dd className="mt-1 text-white/70">{label}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-10 text-xs text-white/50">Departs from {business.location.dock}</p>
      </div>
    </section>
  );
}
