import Link from "next/link";
import { formatMoney, pricing, schedule } from "@/lib/config";
import { dailySlots } from "@/lib/schedule";

export function Schedule() {
  const slots = dailySlots();
  return (
    <section id="schedule" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div>
            <p className="eyebrow">Tour times</p>
            <h2 className="font-display mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
              Every hour, every day. Pick the light you love.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-ink-soft">
              We run {slots.length} departures a day, 7 days a week, from 7am until the last boat returns at 5pm.
              Morning tours are calmest on the water. Late afternoon brings golden light and the busiest
              haul-outs.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
              {slots.map((s) => (
                <Link
                  key={s.time}
                  href={`/book?time=${s.time}`}
                  className="group rounded-2xl border border-ink/10 bg-white px-4 py-3 text-center transition hover:-translate-y-0.5 hover:border-teal hover:shadow-lg"
                >
                  <span className="block whitespace-nowrap font-display text-lg font-semibold group-hover:text-teal">{s.label}</span>
                  <span className="block whitespace-nowrap text-xs text-ink-soft">back {s.returnsLabel}</span>
                </Link>
              ))}
            </div>
            <p className="mt-4 text-sm text-ink-soft">
              Online booking closes {schedule.cutoffMinutes} minutes before departure. Walk-ups welcome if seats remain.
            </p>
          </div>

          <div className="card p-8 sm:p-10">
            <p className="eyebrow">Tickets</p>
            <h3 className="font-display mt-3 text-3xl font-semibold">Simple pricing, no hidden fees.</h3>
            <ul className="mt-8 divide-y divide-ink/10">
              <li className="flex items-baseline justify-between py-4">
                <div>
                  <p className="font-semibold">Adult</p>
                  <p className="text-sm text-ink-soft">Ages 13 and up</p>
                </div>
                <p className="font-display text-3xl font-semibold">{formatMoney(pricing.adult)}</p>
              </li>
              <li className="flex items-baseline justify-between py-4">
                <div>
                  <p className="font-semibold">Child</p>
                  <p className="text-sm text-ink-soft">Ages {pricing.childAgeRange}</p>
                </div>
                <p className="font-display text-3xl font-semibold">{formatMoney(pricing.child)}</p>
              </li>
              <li className="flex items-baseline justify-between py-4">
                <div>
                  <p className="font-semibold">Little ones</p>
                  <p className="text-sm text-ink-soft">Under {pricing.freeUnderAge}, on a lap</p>
                </div>
                <p className="font-display text-3xl font-semibold text-teal">Free</p>
              </li>
            </ul>
            <ul className="mt-6 space-y-2 text-sm text-ink-soft">
              {[
                "Life vests, binoculars, and a guide who knows the animals by name",
                "Full refund up to 24 hours before departure",
                "Weather cancellations rebooked or refunded, your choice",
                `Private charters available for groups of ${schedule.capacity}`,
              ].map((f) => (
                <li key={f} className="flex gap-2.5">
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-teal" viewBox="0 0 20 20" fill="currentColor"><path d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 111.4-1.4L8 12.6l7.3-7.3a1 1 0 011.4 0z" /></svg>
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/book" className="btn btn-coral mt-8 w-full !py-4 !text-base">
              Choose a departure
            </Link>
            <p className="mt-3 text-center text-xs text-ink-soft">Secure checkout powered by Stripe</p>
          </div>
        </div>
      </div>
    </section>
  );
}
