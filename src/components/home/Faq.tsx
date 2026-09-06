import { business, pricing, schedule } from "@/lib/config";

const faqs = [
  {
    q: "Where do tours leave from?",
    a: `${business.location.dock}, ${business.location.addressLine1}, ${business.location.addressLine2}. Please arrive 15 minutes before your departure time so we can leave on the hour.`,
  },
  {
    q: "Will we definitely see seals and sea lions?",
    a: "Yes. The colonies live in the harbor year-round, and we have never had a tour without sightings. Spring brings harbor seal pups; late summer and fall bring the largest sea lion crowds.",
  },
  {
    q: "Is the tour suitable for kids and older guests?",
    a: `Absolutely. The boat is stable and covered, the water inside the harbor is calm, and the tour is only ${schedule.durationMinutes} minutes. Children under ${pricing.freeUnderAge} ride free on a lap. Life vests are provided in all sizes.`,
  },
  {
    q: "What should I bring?",
    a: "A layer more than you think you need (it is cooler on the water), sunglasses, and a camera. We supply binoculars and life vests. Please leave food at the dock so we don't attract gulls.",
  },
  {
    q: "What if the weather is bad?",
    a: "We run rain or shine, but if the harbormaster closes the harbor for wind or swell we will contact you right away and rebook you or refund you in full. Your choice.",
  },
  {
    q: "What is the cancellation policy?",
    a: "Cancel up to 24 hours before departure for a full refund. Inside 24 hours we will do our best to move you to another departure.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-20 bg-sand-deep py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[1fr_1.6fr]">
        <div>
          <p className="eyebrow">Good to know</p>
          <h2 className="font-display mt-3 text-4xl font-semibold leading-tight sm:text-5xl">Questions from the dock.</h2>
          <p className="mt-5 text-ink-soft">
            Something else on your mind? Call{" "}
            <a href={`tel:${business.phone.replace(/\D/g, "")}`} className="font-semibold text-teal">{business.phone}</a> or
            email <a href={`mailto:${business.email}`} className="font-semibold text-teal">{business.email}</a>.
          </p>
        </div>
        <div className="divide-y divide-ink/10">
          {faqs.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-display text-xl font-semibold marker:content-none">
                {f.q}
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-ink transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 max-w-2xl leading-relaxed text-ink-soft">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
