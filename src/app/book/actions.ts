"use server";

import { redirect } from "next/navigation";
import type Stripe from "stripe";
import { business, pricing, schedule } from "@/lib/config";
import { attachStripeSession, createHold, setStatus } from "@/lib/db";
import { formatDateLong, formatTimeLabel, isSlotOpen, isValidDateString, isValidSlotTime } from "@/lib/schedule";
import { getStripe, stripeConfigured } from "@/lib/stripe";

export type CheckoutState = { error?: string } | null;

const int = (v: FormDataEntryValue | null, max: number) => {
  const n = Number.parseInt(String(v ?? "0"), 10);
  return Number.isFinite(n) ? Math.min(Math.max(n, 0), max) : 0;
};

export async function startCheckout(_prev: CheckoutState, form: FormData): Promise<CheckoutState> {
  const date = String(form.get("date") ?? "");
  const time = String(form.get("time") ?? "");
  const adults = int(form.get("adults"), schedule.capacity);
  const children = int(form.get("children"), schedule.capacity);
  const infants = int(form.get("infants"), 6);
  const name = String(form.get("name") ?? "").trim().slice(0, 120);
  const email = String(form.get("email") ?? "").trim().slice(0, 200);
  const phone = String(form.get("phone") ?? "").trim().slice(0, 40);

  if (!isValidDateString(date) || !isValidSlotTime(time)) return { error: "Please choose a tour date and departure time." };
  if (!isSlotOpen(date, time)) return { error: "That departure is no longer open for online booking. Please pick another time." };
  if (adults < 1) return { error: "At least one adult ticket is required." };
  if (adults + children > schedule.capacity) return { error: `We can seat at most ${schedule.capacity} guests per departure.` };
  if (name.length < 2) return { error: "Please enter the name for the booking." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Please enter a valid email address for your tickets." };
  if (!stripeConfigured()) return { error: "Online payments aren't configured yet. Add STRIPE_SECRET_KEY to .env.local (see README)." };

  const amount = adults * pricing.adult + children * pricing.child;

  let booking;
  try {
    booking = createHold({ tour_date: date, tour_time: time, adults, children, infants, name, email, phone: phone || null, amount_total: amount });
  } catch (e) {
    if (e instanceof Error && e.message === "SOLD_OUT") {
      return { error: "Sorry, that departure just filled up. Please choose another time." };
    }
    throw e;
  }

  const tourLabel = `${formatDateLong(date)} · ${formatTimeLabel(time)} departure`;
  const stripe = getStripe();
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
    {
      quantity: adults,
      price_data: {
        currency: business.currency,
        unit_amount: pricing.adult,
        product_data: { name: "Adult ticket", description: tourLabel },
      },
    },
  ];
  if (children > 0) {
    lineItems.push({
      quantity: children,
      price_data: {
        currency: business.currency,
        unit_amount: pricing.child,
        product_data: { name: `Child ticket (ages ${pricing.childAgeRange})`, description: tourLabel },
      },
    });
  }

  let url: string | null = null;
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      customer_email: email,
      phone_number_collection: { enabled: true },
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
      success_url: `${business.siteUrl}/book/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${business.siteUrl}/book?date=${date}&time=${time}&cancelled=1`,
      client_reference_id: booking.id,
      metadata: {
        booking_id: booking.id,
        confirmation_code: booking.confirmation_code,
        tour_date: date,
        tour_time: time,
        adults: String(adults),
        children: String(children),
        infants: String(infants),
        guest_name: name,
      },
      payment_intent_data: {
        description: `${business.shortName}: ${tourLabel} (${booking.confirmation_code})`,
        metadata: { booking_id: booking.id, confirmation_code: booking.confirmation_code },
      },
    });
    attachStripeSession(booking.id, session.id);
    url = session.url;
  } catch (e) {
    setStatus(booking.id, "expired");
    console.error("Stripe checkout session failed", e);
    return { error: "We couldn't start the payment. Please try again in a moment." };
  }

  if (!url) return { error: "We couldn't start the payment. Please try again in a moment." };
  redirect(url);
}
