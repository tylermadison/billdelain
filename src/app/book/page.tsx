import type { Metadata } from "next";
import Image from "next/image";
import { business, pricing, schedule, formatMoney } from "@/lib/config";
import { addDays, isDateBookable, nowInBusinessZone } from "@/lib/schedule";
import { BookingForm } from "./BookingForm";

export const metadata: Metadata = { title: "Book tickets" };
export const dynamic = "force-dynamic";

export default async function BookPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const today = nowInBusinessZone().date;
  const maxDate = addDays(today, schedule.bookingWindowDays);
  const requested = params.date && isDateBookable(params.date) ? params.date : null;
  // Default to today if today still has departures, otherwise tomorrow.
  const initialDate = requested ?? (nowInBusinessZone().minutes < schedule.lastDepartureHour * 60 - schedule.cutoffMinutes ? today : addDays(today, 1));

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
      <div className="grid gap-10 lg:grid-cols-[1.35fr_1fr] lg:gap-14">
        <div>
          <p className="eyebrow">Book tickets</p>
          <h1 className="font-display mt-3 text-4xl font-semibold leading-tight sm:text-5xl">Pick your departure.</h1>
          <p className="mt-3 max-w-xl text-ink-soft">
            Tours run every hour, 7 days a week. Choose a date, a time, and how many are coming. You&apos;ll pay
            securely with Stripe and get a confirmation code to show at the dock.
          </p>
          {params.cancelled && (
            <p className="mt-6 rounded-2xl border border-gold/50 bg-gold/10 px-5 py-4 text-sm">
              Your payment was cancelled and no charge was made. Your seats are released. Pick a time to try again.
            </p>
          )}
          <div className="mt-8">
            <BookingForm minDate={today} maxDate={maxDate} initialDate={initialDate} initialTime={params.time ?? null} />
          </div>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem]">
            <Image src="/images/seal-surf.jpg" alt="Harbor seal playing in the surf" fill sizes="(min-width: 1024px) 35vw, 100vw" className="object-cover" />
          </div>
          <div className="card p-7">
            <h2 className="font-display text-2xl font-semibold">What&apos;s included</h2>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-soft">
              <li>{schedule.durationMinutes}-minute guided tour of the harbor colonies</li>
              <li>Life vests and binoculars for every guest</li>
              <li>Max {schedule.capacity} guests per boat</li>
              <li>Free cancellation up to 24 hours before departure</li>
            </ul>
            <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-ink/10 pt-5 text-center">
              <div><dt className="text-xs text-ink-soft">Adult</dt><dd className="font-display text-xl font-semibold">{formatMoney(pricing.adult)}</dd></div>
              <div><dt className="text-xs text-ink-soft">Child {pricing.childAgeRange}</dt><dd className="font-display text-xl font-semibold">{formatMoney(pricing.child)}</dd></div>
              <div><dt className="text-xs text-ink-soft">Under {pricing.freeUnderAge}</dt><dd className="font-display text-xl font-semibold text-teal">Free</dd></div>
            </dl>
          </div>
          <div className="rounded-[1.75rem] bg-ink p-7 text-sand">
            <h2 className="font-display text-xl font-semibold">Meet at the dock</h2>
            <p className="mt-2 text-sm text-sand/80">
              {business.location.dock}<br />{business.location.addressLine1}, {business.location.addressLine2}
            </p>
            <p className="mt-3 text-sm text-sand/80">Please arrive 15 minutes early. Questions? Call {business.phone}.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
