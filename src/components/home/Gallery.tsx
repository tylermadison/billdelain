import Image from "next/image";

const photos = [
  { src: "/images/seal-surf.jpg", alt: "Harbor seal rolling in the surf", span: "md:col-span-2 md:row-span-2" },
  { src: "/images/sea-lion-eye.jpg", alt: "Close-up of a sea lion's eye and whiskers" },
  { src: "/images/sea-lion-colony.jpg", alt: "A crowded sea lion colony sunning on the rocks", span: "md:row-span-2" },
  { src: "/images/harbor-seal-underwater.jpg", alt: "Harbor seal peering at the camera underwater" },
  { src: "/images/seal-pup-beach.jpg", alt: "Harbor seal pup resting on the sand" },
  { src: "/images/pier-sunset.jpg", alt: "Sea lions hauled out on the docks at sunset", span: "md:col-span-2" },
  { src: "/images/sea-lions-beach.jpg", alt: "Sea lions on a pebble beach" },
];

export function Gallery() {
  return (
    <section id="gallery" className="scroll-mt-20 bg-sand-deep py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Gallery</p>
            <h2 className="font-display mt-3 text-4xl font-semibold leading-tight sm:text-5xl">Straight from the bow.</h2>
          </div>
          <p className="max-w-md text-ink-soft">Every photo here was taken from a boat like ours, at a respectful distance. Bring a zoom lens if you have one.</p>
        </div>
        <div className="mt-12 grid auto-rows-[200px] grid-flow-dense grid-cols-2 gap-3 md:grid-cols-4 md:auto-rows-[240px]">
          {photos.map((p) => (
            <div key={p.src} className={`group relative overflow-hidden rounded-2xl ${p.span ?? ""}`}>
              <Image src={p.src} alt={p.alt} fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover transition duration-700 group-hover:scale-105" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
