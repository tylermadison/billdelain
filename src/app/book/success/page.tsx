import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { business, formatMoney } from "@/lib/config";
import { getBooking, getBookingBySession, markPaid, type Booking } from "@/lib/db";
import { formatDateLong, formatTimeLabel } from "@/lib/schedule";
import { getStripe, stripeConfigured } from "@/lib/stripe";

export const metadata: Metadata = { title: "Booking confirmed" };
export const dynamic = "force-dynamic";

async function resolveBooking(sessionId: string): Promise<Booking | null> {
  let booking = getBookingBySession(sessionId);
  if (booking?.status === "paid") return booking;
  if (!stripeConfigured()) return booking;
  // The webhook normally confirms payment. Verify with Stripe directly as well so the
  // confirmation shows immediately even if webhooks aren't set up yet (e.g. local dev).
  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    const id = session.metadata?.booking_id ?? session.client_reference_id ?? booking?.id;
    if (id && session.payment_status === "paid") {
      markPaid(id, typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id, {
        name: session.customer_details?.name,
        email: session.customer_details?.email,
        phone: session.customer_details?.phone,
      });
      booking = getBooking(id);
    } else if (id && !booking) {
      booking = getBooking(id);
    }
  } catch (e) {
    console.error("Could not verify Stripe session", e);
  }
  return booking;
}

export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id } = await searchParams;
  const booking = session_id ? await resolveBooking(session_id) : null;

  if (!booking) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center">
        <h1 className="font-display text-3xl font-semibold">We couldn&apos;t find that booking.</h1>
        <p className="mt-3 text-ink-soft">If you completed a payment, check your email for a receipt from Stripe, or call {business.phone} and we&apos;ll sort it out.</p>
        <Link href="/book" className="btn btn-ink mt-8">Back to booking</Link>
      </div>
    );
  }

  const paid = booking.status === "paid";
  return (
    <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
      <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-start">
        <div>
          <p className="eyebrow">{paid ? "You're booked" : "Payment processing"}</p>
          <h1 className="font-display mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
            {paid ? "See you at the dock!" : "Almost there."}
          </h1>
          <p className="mt-4 max-w-xl text-lg text-ink-soft">
            {paid
              ? `Your tickets are confirmed. A receipt has been sent to ${booking.email}. Show the confirmation code below at ${business.location.dock}, 15 minutes before departure.`
              : "Your payment is still being confirmed. This page will show your confirmation as soon as it clears. Refresh in a moment, or check your email."}
          </p>

          <div className="card mt-8 overflow-hidden">
            <div className="bg-ink px-7 py-5 text-sand">
              <p className="text-xs uppercase tracking-[0.18em] text-sand/60">Confirmation code</p>
              <p className="font-display mt-1 text-4xl font-semibold tracking-wide">{booking.confirmation_code}</p>
            </div>
            <dl className="grid gap-x-8 gap-y-5 px-7 py-7 sm:grid-cols-2">
              <Item label="Tour date" value={formatDateLong(booking.tour_date)} />
              <Item label="Departure" value={`${formatTimeLabel(booking.tour_time)} (returns in about an hour)`} />
              <Item label="Guests" value={`${booking.adults} adult${booking.adults === 1 ? "" : "s"}${booking.children ? `, ${booking.children} child${booking.children === 1 ? "" : "ren"}` : ""}${booking.infants ? `, ${booking.infants} little one${booking.infants === 1 ? "" : "s"}` : ""}`} />
              <Item label="Total paid" value={formatMoney(booking.amount_total)} />
              <Item label="Name" value={booking.name} />
              <Item label="Status" value={paid ? "Paid ✓" : "Pending payment"} />
            </dl>
          </div>

          <div className="mt-8 rounded-[1.5rem] bg-sand-deep p-6 text-sm text-ink-soft">
            <p className="font-semibold text-ink">Before you arrive</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Meet at {business.location.dock}, {business.location.addressLine1}, {business.location.addressLine2}.</li>
              <li>Bring a warm layer and sunglasses. We provide life vests and binoculars.</li>
              <li>Need to change plans? Call {business.phone} at least 24 hours ahead for a full refund.</li>
            </ul>
          </div>
          <Link href="/" className="btn btn-outline mt-8">Back to home</Link>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem]">
          <Image src="/images/sea-lion-gulls.jpg" alt="Sea lion on the beach with gulls" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
        </div>
      </div>
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-[0.14em] text-ink-soft">{label}</dt>
      <dd className="mt-1 font-semibold">{value}</dd>
    </div>
  );
}
