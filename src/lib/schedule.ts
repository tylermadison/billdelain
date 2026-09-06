import { business, schedule } from "./config";

export type Slot = {
  /** "HH:MM" 24h, e.g. "07:00" */
  time: string;
  label: string; // "7:00 AM"
  returnsLabel: string; // "8:00 AM"
};

const pad = (n: number) => String(n).padStart(2, "0");

export function formatTimeLabel(time: string) {
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${pad(m)} ${suffix}`;
}

/** All departures in a day, regardless of availability. */
export function dailySlots(): Slot[] {
  const slots: Slot[] = [];
  for (let h = schedule.firstDepartureHour; h <= schedule.lastDepartureHour; h++) {
    const time = `${pad(h)}:00`;
    const endMinutes = h * 60 + schedule.durationMinutes;
    const returns = `${pad(Math.floor(endMinutes / 60))}:${pad(endMinutes % 60)}`;
    slots.push({ time, label: formatTimeLabel(time), returnsLabel: formatTimeLabel(returns) });
  }
  return slots;
}

/** Returns { date: "YYYY-MM-DD", minutes: minutes since midnight } for "now" in the business timezone. */
export function nowInBusinessZone(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: business.timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  };
}

export function isValidDateString(s: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`));
}

export function dayOfWeek(date: string) {
  return new Date(`${date}T00:00:00Z`).getUTCDay();
}

export function addDays(date: string, days: number) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function formatDateLong(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

export function isTourDay(date: string) {
  return (schedule.daysOfWeek as readonly number[]).includes(dayOfWeek(date));
}

/** A date is bookable if it is today or within the booking window and tours run that day. */
export function isDateBookable(date: string, now = new Date()) {
  if (!isValidDateString(date)) return false;
  const today = nowInBusinessZone(now).date;
  const last = addDays(today, schedule.bookingWindowDays);
  return date >= today && date <= last && isTourDay(date);
}

/** Whether a departure on a date is still open for online booking (cutoff applied). */
export function isSlotOpen(date: string, time: string, now = new Date()) {
  if (!isDateBookable(date, now)) return false;
  const current = nowInBusinessZone(now);
  if (date > current.date) return true;
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m - schedule.cutoffMinutes > current.minutes;
}

export function isValidSlotTime(time: string) {
  return dailySlots().some((s) => s.time === time);
}
