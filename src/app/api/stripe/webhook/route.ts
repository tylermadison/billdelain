import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getBooking, getBookingByPaymentIntent, getBookingBySession, markPaid, setStatus } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

/**
 * Stripe webhook. Configure the endpoint in the Stripe dashboard (or `stripe listen`
 * locally) and put the signing secret in STRIPE_WEBHOOK_SECRET.
 * Events handled: checkout.session.completed, checkout.session.async_payment_succeeded,
 * checkout.session.async_payment_failed, checkout.session.expired, charge.refunded.
 */
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers.get("stripe-signature");
  if (!secret || !sig) return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(await req.text(), sig, secret);
  } catch (e) {
    console.error("Webhook signature verification failed", e);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object;
      const booking = findBooking(session);
      if (booking && session.payment_status === "paid") {
        markPaid(booking.id, typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id, {
          name: session.customer_details?.name,
          email: session.customer_details?.email,
          phone: session.customer_details?.phone,
        });
      }
      break;
    }
    case "checkout.session.async_payment_failed":
    case "checkout.session.expired": {
      const booking = findBooking(event.data.object);
      if (booking && booking.status === "pending") setStatus(booking.id, "expired");
      break;
    }
    case "charge.refunded": {
      const charge = event.data.object;
      const pi = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
      const booking = pi ? getBookingByPaymentIntent(pi) : null;
      if (booking && charge.refunded) setStatus(booking.id, "refunded");
      break;
    }
    default:
      break;
  }
  return NextResponse.json({ received: true });
}

function findBooking(session: Stripe.Checkout.Session) {
  const id = session.metadata?.booking_id ?? session.client_reference_id;
  return (id ? getBooking(id) : null) ?? getBookingBySession(session.id);
}
