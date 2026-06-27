import Link from "next/link";
import { MapPin, Bus, Users, ShieldCheck } from "lucide-react";

/**
 * Homepage SEO intro — carries the page's single <h1> and explains, in plain
 * Indian English, that TripSangam runs Nepal tours starting from Raxaul.
 * No prices/durations are stated here (those live on package pages).
 */
export function HomeIntro() {
  return (
    <section className="mx-auto max-w-5xl px-5 pt-16 md:px-8 md:pt-24">
      <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-crimson">
        <span className="h-px w-8 bg-crimson" /> Raxaul · Bihar · India–Nepal border
      </p>
      <h1 className="balance mt-3 font-serif text-4xl tracking-tight md:text-5xl">
        Nepal Tour Packages from Raxaul
      </h1>
      <div className="mt-5 max-w-3xl space-y-4 text-[15px] leading-relaxed text-muted md:text-base">
        <p>
          TripSangam Travels plans complete Nepal tours that begin right here in Raxaul, on the
          India–Nepal border in East Champaran, Bihar. Whether you are travelling for darshan, a
          family holiday or your first trip to the Himalayas, we look after the journey from the
          Raxaul–Birgunj border onward — you simply reach Raxaul and we take care of the rest.
        </p>
        <p>
          From Raxaul you can reach <strong className="text-ink dark:text-white">Kathmandu, Pokhara,
          Muktinath, Chitwan, Lumbini and Nagarkot</strong>. We arrange private vehicles and group
          tours, help with the Birgunj border formalities, and put together itineraries for
          pilgrimage, family and leisure travel. To plan your trip, call or WhatsApp{" "}
          <a href="tel:+917678538192" className="font-semibold text-ink underline-offset-2 hover:underline dark:text-white">+91&nbsp;76785&nbsp;38192</a>{" "}
          for a quotation.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
        <Link href="/nepal-tour-packages/" className="inline-flex items-center gap-1.5 font-medium text-ink underline-offset-4 hover:underline dark:text-white">
          Browse all Nepal tour packages
        </Link>
        <Link href="/raxaul-to-kathmandu-travel/" className="inline-flex items-center gap-1.5 font-medium text-ink underline-offset-4 hover:underline dark:text-white">
          Raxaul to Kathmandu travel guide
        </Link>
        <Link href="/nepal-tour-package-from-raxaul/" className="inline-flex items-center gap-1.5 font-medium text-ink underline-offset-4 hover:underline dark:text-white">
          Nepal tour package from Raxaul
        </Link>
      </div>

      <ul className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: MapPin, t: "Starts at Raxaul", d: "Pickup from Raxaul railway station / Birgunj border." },
          { icon: ShieldCheck, t: "Border assistance", d: "Help with the Raxaul–Birgunj crossing into Nepal." },
          { icon: Bus, t: "Private or group", d: "Private vehicles or shared group departures." },
          { icon: Users, t: "Family & pilgrimage", d: "Comfortable plans for families and senior citizens." },
        ].map((f) => {
          const Icon = f.icon;
          return (
            <li key={f.t} className="rounded-3xl border border-line bg-white p-5 dark:bg-white/5">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-sand text-ink dark:bg-white/10 dark:text-white">
                <Icon className="h-5 w-5" strokeWidth={1.6} />
              </span>
              <p className="mt-3 font-serif text-lg text-ink dark:text-white">{f.t}</p>
              <p className="mt-1 text-sm text-muted">{f.d}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
