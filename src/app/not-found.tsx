import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-5 py-28 text-center">
      <p className="eyebrow">404</p>
      <h1 className="font-display mt-3 text-4xl font-semibold">That page swam off.</h1>
      <p className="mt-3 text-ink-soft">Let&apos;s get you back to the dock.</p>
      <Link href="/" className="btn btn-ink mt-8">Back to home</Link>
    </div>
  );
}
