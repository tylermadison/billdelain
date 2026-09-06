import type { Metadata } from "next";
import Link from "next/link";
import { formatMoney, schedule } from "@/lib/config";
import { listBookingsForDate, listRecentBookings, type Booking } from "@/lib/db";
import { addDays, dailySlots, formatDateLong, formatTimeLabel, isValidDateString, nowInBusinessZone } from "@/lib/schedule";
import { logout } from "./actions";
import { adminConfigured, isAdmin } from "./auth";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Manifest", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ date?: string; view?: string }> }) {
  const params = await searchParams;

  if (!adminConfigured()) {
    return <Shell><p className="mt-6 rounded-2xl bg-white p-6 text-ink-soft ring-1 ring-ink/10">Set <code>ADMIN_PASSWORD</code> in <code>.env.local</code> to enable the manifest page.</p></Shell>;
  }
  if (!(await isAdmin())) {
    return <Shell><LoginForm /></Shell>;
  }

  const today = nowInBusinessZone().date;
  const date = params.date && isValidDateString(params.date) ? params.date : today;

  if (params.view === "recent") {
    const rows = listRecentBookings(100);
    return (
      <Shell date={date}>
        <h2 className="font-display mt-8 text-2xl font-semibold">Recent bookings</h2>
        <BookingTable rows={rows} showDate />
      </Shell>
    );
  }

  const bookings = listBookingsForDate(date);
  const byTime = Object.groupBy(bookings, (b) => b.tour_time);
  const paidSeats = bookings.filter((b) => b.status === "paid").reduce((n, b) => n + b.adults + b.children, 0);
  const revenue = bookings.filter((b) => b.status === "paid").reduce((n, b) => n + b.amount_total, 0);

  return (
    <Shell date={date}>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Link href={`/admin?date=${addDays(date, -1)}`} className="btn btn-outline !px-4 !py-2">← Prev day</Link>
        <form className="flex items-center gap-2">
          <input type="date" name="date" defaultValue={date} className="field !w-auto !py-2" />
          <button className="btn btn-ink !px-4 !py-2">Go</button>
        </form>
        <Link href={`/admin?date=${addDays(date, 1)}`} className="btn btn-outline !px-4 !py-2">Next day →</Link>
        <Link href={`/admin?date=${today}`} className="text-sm font-semibold text-teal">Today</Link>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Date" value={formatDateLong(date)} />
        <Stat label="Paid seats" value={`${paidSeats} of ${schedule.capacity * dailySlots().length}`} />
        <Stat label="Revenue" value={formatMoney(revenue)} />
      </div>
      <div className="mt-8 space-y-6">
        {dailySlots().map((slot) => {
          const rows = byTime[slot.time] ?? [];
          const seats = rows.filter((b) => b.status === "paid").reduce((n, b) => n + b.adults + b.children, 0);
          const held = rows.filter((b) => b.status === "pending").reduce((n, b) => n + b.adults + b.children, 0);
          return (
            <section key={slot.time} className="card overflow-hidden">
              <header className="flex flex-wrap items-center justify-between gap-3 bg-ink px-6 py-3 text-sand">
                <h3 className="font-display text-xl font-semibold">{slot.label} departure</h3>
                <p className="text-sm text-sand/80">
                  {seats} / {schedule.capacity} seats paid{held ? ` · ${held} on hold` : ""}
                </p>
              </header>
              {rows.length === 0 ? <p className="px-6 py-4 text-sm text-ink-soft">No bookings yet.</p> : <BookingTable rows={rows} />}
            </section>
          );
        })}
      </div>
    </Shell>
  );
}

function Shell({ children, date }: { children: React.ReactNode; date?: string }) {
  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="font-display mt-2 text-4xl font-semibold">Passenger manifest</h1>
        </div>
        {date && (
          <div className="flex items-center gap-3 text-sm font-semibold">
            <Link href={`/admin?date=${date}`} className="text-teal">By day</Link>
            <Link href="/admin?view=recent" className="text-teal">Recent bookings</Link>
            <form action={logout}><button className="btn btn-outline !px-4 !py-2">Sign out</button></form>
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-5">
      <p className="text-xs uppercase tracking-[0.14em] text-ink-soft">{label}</p>
      <p className="font-display mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function BookingTable({ rows, showDate = false }: { rows: Booking[]; showDate?: boolean }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-sand text-left text-xs uppercase tracking-wider text-ink-soft">
          <tr>
            <th className="px-6 py-2">Code</th>
            {showDate && <th className="px-3 py-2">Tour</th>}
            <th className="px-3 py-2">Name</th>
            <th className="px-3 py-2">Contact</th>
            <th className="px-3 py-2">Guests</th>
            <th className="px-3 py-2">Total</th>
            <th className="px-3 py-2">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/5">
          {rows.map((b) => (
            <tr key={b.id}>
              <td className="px-6 py-3 font-mono font-semibold">{b.confirmation_code}</td>
              {showDate && <td className="px-3 py-3 whitespace-nowrap">{b.tour_date} {formatTimeLabel(b.tour_time)}</td>}
              <td className="px-3 py-3">{b.name}</td>
              <td className="px-3 py-3 text-ink-soft">{b.email}{b.phone ? <><br />{b.phone}</> : null}</td>
              <td className="px-3 py-3">{b.adults}A{b.children ? ` ${b.children}C` : ""}{b.infants ? ` ${b.infants}I` : ""}</td>
              <td className="px-3 py-3">{formatMoney(b.amount_total)}</td>
              <td className="px-3 py-3"><StatusPill status={b.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusPill({ status }: { status: Booking["status"] }) {
  const styles: Record<Booking["status"], string> = {
    paid: "bg-teal/15 text-teal-deep",
    pending: "bg-gold/20 text-yellow-800",
    expired: "bg-ink/10 text-ink-soft",
    cancelled: "bg-ink/10 text-ink-soft",
    refunded: "bg-coral/15 text-coral-deep",
  };
  return <span className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase ${styles[status]}`}>{status}</span>;
}
