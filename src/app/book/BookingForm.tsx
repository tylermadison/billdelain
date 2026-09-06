"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { formatMoney, pricing, schedule } from "@/lib/config";
import { startCheckout, type CheckoutState } from "./actions";

type SlotInfo = {
  time: string;
  label: string;
  returnsLabel: string;
  remaining: number;
  open: boolean;
  reason: "closed" | "past" | "sold_out" | null;
};

type Availability = { date: string; bookable: boolean; capacity: number; slots: SlotInfo[] };

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
}

export function BookingForm({ minDate, maxDate, initialDate, initialTime }: { minDate: string; maxDate: string; initialDate: string; initialTime: string | null }) {
  const [date, setDate] = useState(initialDate);
  const [chosenTime, setTime] = useState<string | null>(initialTime);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [availability, setAvailability] = useState<Availability | null>(null);
  const loading = !availability || availability.date !== date;
  const [state, formAction, pending] = useActionState<CheckoutState, FormData>(startCheckout, null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/availability?date=${date}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data: Availability) => {
        if (!cancelled) setAvailability(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [date, state]);

  // Ignore a chosen time that is no longer open (sold out or departed) once availability is known.
  const time = availability && availability.date === date && chosenTime && !availability.slots.some((s) => s.time === chosenTime && s.open) ? null : chosenTime;
  const selected = useMemo(() => (availability?.date === date ? availability.slots.find((s) => s.time === time) ?? null : null), [availability, date, time]);
  const seats = adults + children;
  const total = adults * pricing.adult + children * pricing.child;
  const tooMany = selected ? seats > selected.remaining : seats > schedule.capacity;
  const canSubmit = Boolean(selected?.open) && !tooMany && adults >= 1 && !pending;

  return (
    <form action={formAction} className="space-y-10">
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="time" value={time ?? ""} />

      <Step n={1} title="Choose a date">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="date"
            className="field max-w-xs"
            value={date}
            min={minDate}
            max={maxDate}
            onChange={(e) => {
              if (e.target.value) {
                setDate(e.target.value);
                setTime(null);
              }
            }}
            aria-label="Tour date"
          />
          <div className="flex gap-2">
            {[0, 1, 2].map((offset) => {
              const d = new Date(`${minDate}T00:00:00Z`);
              d.setUTCDate(d.getUTCDate() + offset);
              const iso = d.toISOString().slice(0, 10);
              const label = offset === 0 ? "Today" : offset === 1 ? "Tomorrow" : new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "UTC" }).format(d);
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => {
                    setDate(iso);
                    setTime(null);
                  }}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${date === iso ? "bg-ink text-white" : "bg-white text-ink-soft ring-1 ring-ink/10 hover:ring-teal"}`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
        <p className="mt-3 text-sm text-ink-soft">{formatDate(date)}</p>
      </Step>

      <Step n={2} title="Choose a departure">
        {loading && !availability ? (
          <p className="text-sm text-ink-soft">Checking seats…</p>
        ) : availability && !availability.bookable ? (
          <p className="rounded-2xl bg-white px-5 py-4 text-sm text-ink-soft ring-1 ring-ink/10">No tours are bookable on this date. Please choose another day.</p>
        ) : (
          <div className={`grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 ${loading ? "opacity-60" : ""}`}>
            {availability?.slots.map((s) => {
              const active = s.time === time;
              const few = s.open && s.remaining <= 4;
              return (
                <button
                  key={s.time}
                  type="button"
                  disabled={!s.open}
                  onClick={() => setTime(s.time)}
                  aria-pressed={active}
                  className={`rounded-2xl border px-3 py-3 text-left transition ${
                    active
                      ? "border-teal bg-teal text-white shadow-lg"
                      : s.open
                        ? "border-ink/10 bg-white hover:-translate-y-0.5 hover:border-teal hover:shadow-md"
                        : "cursor-not-allowed border-transparent bg-ink/5 text-ink/40"
                  }`}
                >
                  <span className="block font-display text-lg font-semibold">{s.label}</span>
                  <span className={`block text-xs ${active ? "text-white/80" : few ? "font-semibold text-coral" : "text-ink-soft"}`}>
                    {s.reason === "sold_out" ? "Sold out" : s.reason === "past" ? "Departed" : s.reason === "closed" ? "Closed" : few ? `${s.remaining} seats left` : `${s.remaining} seats`}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </Step>

      <Step n={3} title="Who's coming?">
        <div className="grid gap-4 sm:grid-cols-3">
          <Counter label="Adults" hint={`13+ · ${formatMoney(pricing.adult)}`} name="adults" value={adults} min={1} max={schedule.capacity} onChange={setAdults} />
          <Counter label="Children" hint={`${pricing.childAgeRange} · ${formatMoney(pricing.child)}`} name="children" value={children} min={0} max={schedule.capacity - 1} onChange={setChildren} />
          <Counter label="Infants" hint={`Under ${pricing.freeUnderAge} · free on a lap`} name="infants" value={infants} min={0} max={4} onChange={setInfants} />
        </div>
        {tooMany && (
          <p className="mt-3 text-sm font-semibold text-coral">
            {selected ? `Only ${selected.remaining} seat${selected.remaining === 1 ? "" : "s"} left on the ${selected.label} boat.` : `We can seat at most ${schedule.capacity} guests per departure.`}
          </p>
        )}
      </Step>

      <Step n={4} title="Your details">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">Name on the booking</span>
            <input name="name" required minLength={2} className="field" placeholder="Jordan Rivera" autoComplete="name" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">Email for your tickets</span>
            <input name="email" type="email" required className="field" placeholder="you@example.com" autoComplete="email" />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-sm font-semibold">Mobile number <span className="font-normal text-ink-soft">(optional, for weather updates)</span></span>
            <input name="phone" type="tel" className="field" placeholder="(555) 555-0123" autoComplete="tel" />
          </label>
        </div>
      </Step>

      <div className="card flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <p className="text-sm text-ink-soft">
            {selected ? `${formatDate(date)} · ${selected.label} departure` : "Select a departure to continue"}
          </p>
          <p className="mt-1 font-display text-3xl font-semibold">
            {formatMoney(total)}
            <span className="ml-2 text-base font-normal text-ink-soft">
              {adults} adult{adults === 1 ? "" : "s"}{children ? `, ${children} child${children === 1 ? "" : "ren"}` : ""}{infants ? `, ${infants} little one${infants === 1 ? "" : "s"}` : ""}
            </span>
          </p>
          {state?.error && <p className="mt-3 text-sm font-semibold text-coral">{state.error}</p>}
        </div>
        <button type="submit" className="btn btn-coral !px-8 !py-4 !text-base" disabled={!canSubmit}>
          {pending ? "Opening secure checkout…" : "Continue to payment"}
        </button>
      </div>
      <p className="-mt-6 text-center text-xs text-ink-soft sm:text-left">Payments are processed by Stripe. Your seats are held for 30 minutes while you check out.</p>
    </form>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="flex items-center gap-3 font-display text-2xl font-semibold">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-ink font-sans text-sm font-bold text-white">{n}</span>
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Counter({ label, hint, name, value, min, max, onChange }: { label: string; hint: string; name: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white p-4 ring-1 ring-ink/10">
      <div>
        <p className="font-semibold">{label}</p>
        <p className="text-xs text-ink-soft">{hint}</p>
      </div>
      <div className="flex items-center gap-2">
        <input type="hidden" name={name} value={value} />
        <button type="button" aria-label={`Fewer ${label.toLowerCase()}`} onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} className="grid h-9 w-9 place-items-center rounded-full bg-sand text-lg font-bold text-ink hover:bg-sand-deep disabled:opacity-30">−</button>
        <span className="w-6 text-center font-display text-xl font-semibold">{value}</span>
        <button type="button" aria-label={`More ${label.toLowerCase()}`} onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} className="grid h-9 w-9 place-items-center rounded-full bg-sand text-lg font-bold text-ink hover:bg-sand-deep disabled:opacity-30">+</button>
      </div>
    </div>
  );
}
