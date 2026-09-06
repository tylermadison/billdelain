import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { randomBytes } from "node:crypto";
import { schedule } from "./config";

export type BookingStatus = "pending" | "paid" | "expired" | "cancelled" | "refunded";

export type Booking = {
  id: string;
  confirmation_code: string;
  tour_date: string;
  tour_time: string;
  adults: number;
  children: number;
  infants: number;
  name: string;
  email: string;
  phone: string | null;
  amount_total: number;
  status: BookingStatus;
  stripe_session_id: string | null;
  stripe_payment_intent: string | null;
  created_at: string;
  updated_at: string;
};

/** Pending checkouts hold their seats for this long (Stripe Checkout sessions expire after 30 min). */
const HOLD_MINUTES = 30;

declare global {
  var __seal_db: DatabaseSync | undefined;
}

function open() {
  const path = process.env.DATABASE_PATH
    ? resolve(/* turbopackIgnore: true */ process.env.DATABASE_PATH)
    : join(process.cwd(), "data", "bookings.db");
  mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA busy_timeout = 5000;
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      confirmation_code TEXT NOT NULL UNIQUE,
      tour_date TEXT NOT NULL,
      tour_time TEXT NOT NULL,
      adults INTEGER NOT NULL,
      children INTEGER NOT NULL DEFAULT 0,
      infants INTEGER NOT NULL DEFAULT 0,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      amount_total INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      stripe_session_id TEXT UNIQUE,
      stripe_payment_intent TEXT,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
      updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
    );
    CREATE INDEX IF NOT EXISTS bookings_tour_idx ON bookings (tour_date, tour_time, status);
  `);
  return db;
}

export function getDb() {
  if (!globalThis.__seal_db) globalThis.__seal_db = open();
  return globalThis.__seal_db;
}

/** Mark stale pending bookings as expired so their seats free up. */
export function expireStaleHolds() {
  getDb()
    .prepare(
      `UPDATE bookings SET status = 'expired', updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
       WHERE status = 'pending' AND created_at < strftime('%Y-%m-%dT%H:%M:%fZ','now', ?)`,
    )
    .run(`-${HOLD_MINUTES} minutes`);
}

/** Seats taken (paid + active holds) per departure for a date. */
export function seatsTakenByTime(date: string): Record<string, number> {
  expireStaleHolds();
  const rows = getDb()
    .prepare(
      `SELECT tour_time, SUM(adults + children) AS seats FROM bookings
       WHERE tour_date = ? AND status IN ('pending','paid') GROUP BY tour_time`,
    )
    .all(date) as { tour_time: string; seats: number }[];
  return Object.fromEntries(rows.map((r) => [r.tour_time, Number(r.seats)]));
}

export function seatsRemaining(date: string, time: string) {
  return Math.max(0, schedule.capacity - (seatsTakenByTime(date)[time] ?? 0));
}

function newCode() {
  // 6 chars from an unambiguous alphabet, e.g. "SL-7KQ4MX"
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(6);
  return "SL-" + Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

export type NewBooking = {
  tour_date: string;
  tour_time: string;
  adults: number;
  children: number;
  infants: number;
  name: string;
  email: string;
  phone?: string | null;
  amount_total: number;
};

/**
 * Atomically reserve seats. Throws "SOLD_OUT" if the departure can't fit the party.
 * The hold lasts HOLD_MINUTES unless confirmed by a successful payment.
 */
export function createHold(input: NewBooking): Booking {
  const db = getDb();
  const seatsWanted = input.adults + input.children;
  const id = randomBytes(12).toString("hex");
  const code = newCode();
  db.exec("BEGIN IMMEDIATE");
  try {
    const remaining = seatsRemaining(input.tour_date, input.tour_time);
    if (seatsWanted > remaining) throw new Error("SOLD_OUT");
    db.prepare(
      `INSERT INTO bookings (id, confirmation_code, tour_date, tour_time, adults, children, infants, name, email, phone, amount_total, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    ).run(
      id,
      code,
      input.tour_date,
      input.tour_time,
      input.adults,
      input.children,
      input.infants,
      input.name,
      input.email,
      input.phone ?? null,
      input.amount_total,
    );
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
  return getBooking(id)!;
}

export function attachStripeSession(id: string, sessionId: string) {
  getDb()
    .prepare(`UPDATE bookings SET stripe_session_id = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = ?`)
    .run(sessionId, id);
}

export function setStatus(id: string, status: BookingStatus, paymentIntent?: string | null) {
  getDb()
    .prepare(
      `UPDATE bookings SET status = ?, stripe_payment_intent = COALESCE(?, stripe_payment_intent),
       updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = ?`,
    )
    .run(status, paymentIntent ?? null, id);
}

/** Confirm payment. Safe to call more than once (webhook + success page). */
export function markPaid(id: string, paymentIntent?: string | null, contact?: { name?: string | null; email?: string | null; phone?: string | null }) {
  getDb()
    .prepare(
      `UPDATE bookings SET status = 'paid',
         stripe_payment_intent = COALESCE(?, stripe_payment_intent),
         name = COALESCE(NULLIF(?, ''), name),
         email = COALESCE(NULLIF(?, ''), email),
         phone = COALESCE(NULLIF(?, ''), phone),
         updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
       WHERE id = ? AND status IN ('pending','expired')`,
    )
    .run(paymentIntent ?? null, contact?.name ?? null, contact?.email ?? null, contact?.phone ?? null, id);
}

export function getBooking(id: string) {
  return (getDb().prepare(`SELECT * FROM bookings WHERE id = ?`).get(id) as Booking | undefined) ?? null;
}

export function getBookingBySession(sessionId: string) {
  return (getDb().prepare(`SELECT * FROM bookings WHERE stripe_session_id = ?`).get(sessionId) as Booking | undefined) ?? null;
}

export function getBookingByPaymentIntent(pi: string) {
  return (getDb().prepare(`SELECT * FROM bookings WHERE stripe_payment_intent = ?`).get(pi) as Booking | undefined) ?? null;
}

export function listBookingsForDate(date: string) {
  expireStaleHolds();
  return getDb()
    .prepare(`SELECT * FROM bookings WHERE tour_date = ? AND status IN ('paid','pending') ORDER BY tour_time, created_at`)
    .all(date) as Booking[];
}

export function listRecentBookings(limit = 50) {
  return getDb()
    .prepare(`SELECT * FROM bookings ORDER BY created_at DESC LIMIT ?`)
    .all(limit) as Booking[];
}
