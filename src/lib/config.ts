/**
 * Central business configuration. Edit this file to change the name,
 * contact details, schedule, pricing, and capacity used across the site.
 */
export const business = {
  name: "Bill Delain Seal & Sea Lion Tours",
  shortName: "Bill Delain Tours",
  tagline: "Meet the harbor's wildest neighbors.",
  description:
    "Small-group boat tours to the seal and sea lion haul-outs of the harbor, led by a local guide who has watched these animals for decades.",
  location: {
    dock: "Dock C, Old Harbor Marina",
    addressLine1: "1 Harbor Way",
    addressLine2: "Seaside, CA 93955",
    mapsUrl: "https://maps.google.com/?q=Old+Harbor+Marina",
  },
  phone: "(555) 010-7325",
  email: "hello@billdelaintours.com",
  /** IANA timezone the tours run in. Used to decide which departures are still bookable today. */
  timeZone: "America/Los_Angeles",
  currency: "usd",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;

export const schedule = {
  /** First departure hour (24h). */
  firstDepartureHour: 7,
  /** Last departure hour (24h). A 4pm departure returns at 5pm. */
  lastDepartureHour: 16,
  /** Tour length in minutes. */
  durationMinutes: 60,
  /** Days of the week tours run: 0 = Sunday ... 6 = Saturday. */
  daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
  /** How far ahead guests can book, in days. */
  bookingWindowDays: 90,
  /** Minimum minutes before departure that online booking closes. */
  cutoffMinutes: 30,
  /** Seats per departure. */
  capacity: 12,
} as const;

/** Prices in cents. */
export const pricing = {
  adult: 4500,
  child: 2500,
  /** Children under this age ride free on a lap and don't take a seat. */
  freeUnderAge: 3,
  childAgeRange: "3–12",
} as const;

export function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: business.currency.toUpperCase(),
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}
