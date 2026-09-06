import Image from "next/image";

const species = [
  {
    name: "California sea lion",
    latin: "Zalophus californianus",
    image: "/images/sea-lion-gulls.jpg",
    alt: "A California sea lion on the beach surrounded by gulls",
    facts: ["Loud, social, and curious about boats", "Males reach 800 lb", "Seen on every tour"],
  },
  {
    name: "Harbor seal",
    latin: "Phoca vitulina",
    image: "/images/harbor-seal-swimming.jpg",
    alt: "A spotted harbor seal swimming with its head above the water",
    facts: ["Shy, spotted, and silent", "Pups born April to June", "Rest at the cove tideline"],
  },
  {
    name: "Underwater acrobats",
    latin: "Sea lions in the kelp",
    image: "/images/sea-lion-underwater.jpg",
    alt: "A sea lion swimming underwater through a kelp forest",
    facts: ["Swim up to 25 mph", "Dive 900 ft deep", "Porpoise beside the boat"],
  },
];

export function Wildlife() {
  return (
    <section id="wildlife" className="scroll-mt-20 bg-ink py-20 text-sand sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <p className="eyebrow !text-gold">Who you&apos;ll meet</p>
          <h2 className="font-display mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
            Two species, hundreds of personalities.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-sand/75">
            Seals and sea lions look alike from the dock, but by the end of the hour you&apos;ll tell them
            apart at a glance. Your guide will show you how, and introduce you to a few regulars by name.
          </p>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {species.map((s) => (
            <article key={s.name} className="group overflow-hidden rounded-[1.75rem] bg-white/5 ring-1 ring-white/10">
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image src={s.image} alt={s.alt} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
              </div>
              <div className="p-6">
                <h3 className="font-display text-2xl font-semibold">{s.name}</h3>
                <p className="mt-0.5 text-sm italic text-sand/55">{s.latin}</p>
                <ul className="mt-4 space-y-2 text-sm text-sand/85">
                  {s.facts.map((f) => (
                    <li key={f} className="flex gap-2.5">
                      <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-12 grid gap-6 rounded-[1.75rem] bg-teal/15 p-7 ring-1 ring-teal/30 md:grid-cols-[auto_1fr] md:items-center">
          <div className="font-display text-5xl">🐾</div>
          <div>
            <h3 className="font-display text-xl font-semibold">Seal or sea lion? The 3-second test</h3>
            <p className="mt-2 text-sand/80">
              <strong className="text-sand">Ear flaps</strong> and a loud bark mean sea lion. <strong className="text-sand">No ear flaps</strong>, a
              spotted coat, and a quiet wriggle along the rocks mean harbor seal. Sea lions &ldquo;walk&rdquo; on their
              big front flippers. Seals scoot on their bellies.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
