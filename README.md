# Bill Delain Seal & Sea Lion Tours

Marketing site and online ticketing for hourly harbor wildlife tours, built with
Next.js 16, Tailwind CSS 4, Stripe Checkout, and a SQLite booking database
(Node's built-in `node:sqlite`, no native build step).

## What's here

| Route | What it does |
| --- | --- |
| `/` | Marketing home: hero, tour itinerary, wildlife, times & prices, gallery, reviews, FAQ |
| `/book` | Ticketing: date picker, live seat availability per departure, party size, contact, Stripe Checkout |
| `/book/success` | Confirmation with a code to show at the dock |
| `/admin` | Password-protected passenger manifest by day, plus recent bookings |
| `/api/availability?date=YYYY-MM-DD` | Seats remaining per departure (used by the booking page) |
| `/api/stripe/webhook` | Stripe webhook: confirms payments, releases expired holds, records refunds |

## Quick start

```bash
npm install
cp .env.example .env.local   # then add your Stripe keys and an admin password
npm run dev                  # http://localhost:3000
```

Requires Node 22.13+ (for `node:sqlite`). Node 24 or newer is recommended.

## Stripe setup

1. Create a Stripe account at https://dashboard.stripe.com and copy your **test** secret key
   (`sk_test_...`) into `STRIPE_SECRET_KEY` in `.env.local`.
2. Forward webhooks to your dev server with the Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   Copy the `whsec_...` it prints into `STRIPE_WEBHOOK_SECRET`.
3. Book a tour on `/book` and pay with test card `4242 4242 4242 4242`, any future expiry, any CVC.
4. In production, add a webhook endpoint in the Stripe dashboard pointing at
   `https://your-domain.com/api/stripe/webhook` with these events:
   `checkout.session.completed`, `checkout.session.async_payment_succeeded`,
   `checkout.session.async_payment_failed`, `checkout.session.expired`, `charge.refunded`.
   Then swap in your live keys.

The success page also verifies the session directly with Stripe, so bookings confirm even
before webhooks are configured. The webhook is what keeps the database right when a guest
closes the tab after paying, and what records refunds you issue from the Stripe dashboard.

Tip: turn on "Successful payments" email receipts in Stripe → Settings → Customer emails so
guests get a receipt automatically.

## How bookings work

- Choosing a departure and clicking **Continue to payment** creates a *pending* booking that
  holds the seats for 30 minutes, then redirects to Stripe Checkout.
- Payment success (webhook or success page) marks it *paid*.
- Cancelled or abandoned checkouts become *expired* and the seats free up automatically.
- Refunds issued in Stripe mark the booking *refunded* and free the seats.
- Seats are counted per departure so a boat can never be oversold, even with simultaneous buyers.

## Change the business details

Everything business-specific lives in `src/lib/config.ts`:

- name, tagline, dock address, phone, email
- timezone (controls which departures are still bookable today)
- first/last departure hour, tour length, days of the week, booking window, cutoff
- seats per boat and ticket prices

Photos are in `public/images/` (see `CREDITS.md` there). Swap them for your own shots of the
boat and the harbor when you have them. The hero image is `hero-sea-lions.jpg`.

Copy on the home page lives in `src/components/home/*.tsx`.

## Admin manifest

Set `ADMIN_PASSWORD` in `.env.local`, then open `/admin`. You'll see each departure for the
day with paid guests, holds, contact details, and confirmation codes. Use it at the dock to
check guests in.

## Deploying

Any host that runs Node works (a small VPS, Railway, Render, Fly.io). Set the environment
variables from `.env.example`, point `DATABASE_PATH` at a persistent disk, and run:

```bash
npm run build
npm start
```

Note: Vercel's serverless filesystem is not persistent, so SQLite won't keep data there. If
you'd rather deploy on Vercel, swap `src/lib/db.ts` for a hosted database (Turso, Neon, or
Vercel Postgres). The rest of the app only talks to the functions exported from that file.
