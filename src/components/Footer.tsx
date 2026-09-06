import Link from "next/link";
import { business, schedule } from "@/lib/config";
import { formatTimeLabel } from "@/lib/schedule";
import { Logo } from "./Logo";

export function Footer() {
  const first = formatTimeLabel(`${String(schedule.firstDepartureHour).padStart(2, "0")}:00`);
  const last = formatTimeLabel(`${String(schedule.lastDepartureHour).padStart(2, "0")}:00`);
  return (
    <footer className="bg-ink text-sand">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <Logo className="h-9 w-9 text-sand" />
            <span className="font-display text-xl font-semibold">{business.name}</span>
          </div>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-sand/70">{business.description}</p>
        </div>
        <div>
          <h3 className="eyebrow !text-gold">Find us</h3>
          <address className="mt-3 not-italic text-sm leading-relaxed text-sand/85">
            {business.location.dock}
            <br />
            {business.location.addressLine1}
            <br />
            {business.location.addressLine2}
          </address>
          <p className="mt-3 text-sm">
            <a href={`tel:${business.phone.replace(/\D/g, "")}`} className="hover:text-gold">{business.phone}</a>
            <br />
            <a href={`mailto:${business.email}`} className="hover:text-gold">{business.email}</a>
          </p>
        </div>
        <div>
          <h3 className="eyebrow !text-gold">Tours run</h3>
          <p className="mt-3 text-sm leading-relaxed text-sand/85">
            7 days a week, rain or shine.
            <br />
            Departures hourly, {first} to {last}.
          </p>
          <Link href="/book" className="btn btn-coral mt-5">Book tickets</Link>
        </div>
      </div>
      <div className="border-t border-sand/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-xs text-sand/50 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span>© {new Date().getFullYear()} {business.name}. All rights reserved.</span>
          <span>We keep a respectful distance from all wildlife, in line with the Marine Mammal Protection Act.</span>
        </div>
      </div>
    </footer>
  );
}
