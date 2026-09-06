import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { business } from "@/lib/config";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz", "SOFT"],
});

export const metadata: Metadata = {
  metadataBase: new URL(business.siteUrl),
  title: {
    default: `${business.name} · Daily harbor wildlife tours`,
    template: `%s · ${business.shortName}`,
  },
  description: business.description,
  openGraph: {
    title: business.name,
    description: business.description,
    images: [{ url: "/images/sea-lion-gulls.jpg", width: 1920, height: 1280 }],
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${manrope.variable} ${fraunces.variable}`}>
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
