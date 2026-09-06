import Link from "next/link";
import { business } from "@/lib/config";
import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";

export const navLinks = [
  { href: "/#experience", label: "The Tour" },
  { href: "/#wildlife", label: "Wildlife" },
  { href: "/#schedule", label: "Times & Prices" },
  { href: "/#gallery", label: "Gallery" },
  { href: "/#faq", label: "FAQ" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink/5 bg-sand/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-3 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5 text-ink">
          <Logo />
          <span className="font-display text-lg font-semibold leading-tight sm:text-xl">
            {business.shortName}
          </span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-semibold text-ink-soft lg:flex">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} className="transition hover:text-teal">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <a href={`tel:${business.phone.replace(/\D/g, "")}`} className="hidden text-sm font-semibold text-ink-soft hover:text-teal md:block">
            {business.phone}
          </a>
          <Link href="/book" className="btn btn-coral !px-5 !py-2.5">
            Book tickets
          </Link>
          <MobileNav links={navLinks} />
        </div>
      </div>
    </header>
  );
}
