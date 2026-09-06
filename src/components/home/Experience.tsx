import Image from "next/image";

const steps = [
  {
    time: "0:00",
    title: "Cast off from the marina",
    body: "Meet your guide at the dock 15 minutes early, grab a life vest and a pair of binoculars, and we're underway on time, every hour.",
  },
  {
    time: "0:10",
    title: "The breakwater haul-out",
    body: "Our first stop is the rocky breakwater where California sea lions pile up by the dozen. Expect barking. Lots of barking.",
  },
  {
    time: "0:25",
    title: "Harbor seal cove",
    body: "We idle quietly into a sheltered cove where shy harbor seals rest at the tideline and pups practice their swimming in spring.",
  },
  {
    time: "0:45",
    title: "Sea lions in the wild",
    body: "On the way back we follow the kelp line, where sea lions porpoise alongside the boat and otters float in the beds. Cameras ready.",
  },
];

export function Experience() {
  return (
    <section id="experience" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-[1fr_1.05fr] lg:items-center">
        <div className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem]">
            <Image src="/images/tour-boat.jpg" alt="Tour boat on calm blue water near the coast" fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
          </div>
          <div className="card animate-float absolute -bottom-6 -right-3 max-w-[16rem] p-5 sm:-right-8">
            <p className="eyebrow">Small groups</p>
            <p className="mt-2 font-display text-2xl font-semibold leading-tight">Twelve seats, one guide, zero crowds.</p>
          </div>
        </div>
        <div>
          <p className="eyebrow">The experience</p>
          <h2 className="font-display mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
            One unforgettable hour, minute by minute.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-ink-soft">
            Every tour follows the same gentle loop through the harbor and out to the kelp, so you always
            get the best of both worlds: the rowdy sea lion colonies and the quiet seal coves.
          </p>
          <ol className="mt-10 space-y-7">
            {steps.map((s) => (
              <li key={s.time} className="flex gap-5">
                <span className="mt-1 h-fit shrink-0 rounded-full bg-teal/10 px-3 py-1 font-mono text-sm font-bold text-teal-deep">
                  {s.time}
                </span>
                <div>
                  <h3 className="font-display text-xl font-semibold">{s.title}</h3>
                  <p className="mt-1.5 leading-relaxed text-ink-soft">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
