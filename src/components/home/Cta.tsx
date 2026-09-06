import Image from "next/image";
import Link from "next/link";

export function Cta() {
  return (
    <section className="relative isolate overflow-hidden bg-ink py-28 text-white sm:py-36">
      <Image src="/images/coastline.jpg" alt="" fill sizes="100vw" className="object-cover opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/30 to-ink/80" />
      <div className="relative mx-auto max-w-3xl px-5 text-center sm:px-8">
        <p className="eyebrow !text-gold">The boat leaves on the hour</p>
        <h2 className="font-display mt-4 text-4xl font-semibold leading-tight sm:text-6xl">
          Your seat on the water is waiting.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg text-white/80">
          Pick a departure, pay securely, and show your confirmation at the dock. That&apos;s it.
        </p>
        <Link href="/book" className="btn btn-coral mt-9 !px-8 !py-4 !text-base">
          Book your tour
        </Link>
      </div>
    </section>
  );
}
