const reviews = [
  {
    quote: "Bill knows every sea lion on that breakwater. Our kids are still talking about the one that swam under the boat.",
    name: "Priya R.",
    detail: "Family of four, 9am tour",
  },
  {
    quote: "We've done whale watching in three countries. This was more intimate, more relaxed, and we saw more animals.",
    name: "Tom & Ana",
    detail: "Anniversary trip, 4pm tour",
  },
  {
    quote: "Booked the 7am on a whim. Glassy water, fog lifting, a hundred seals waking up. Best hour of our vacation.",
    name: "Marcus D.",
    detail: "Solo traveler, 7am tour",
  },
];

export function Testimonials() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="text-center">
          <p className="eyebrow">Guest stories</p>
          <h2 className="font-display mt-3 text-4xl font-semibold leading-tight sm:text-5xl">Five stars, from every departure.</h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {reviews.map((r) => (
            <figure key={r.name} className="card flex flex-col p-8">
              <div className="flex gap-1 text-gold" aria-label="5 out of 5 stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.1 1.1 5.9L10 14.8l-5.3 2.9 1.1-5.9L1.5 7.7l5.9-.8z" /></svg>
                ))}
              </div>
              <blockquote className="font-display mt-5 flex-1 text-xl leading-snug">&ldquo;{r.quote}&rdquo;</blockquote>
              <figcaption className="mt-6 text-sm">
                <span className="font-semibold">{r.name}</span>
                <span className="text-ink-soft"> · {r.detail}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
