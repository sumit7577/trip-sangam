import type { Metadata } from "next";
import Image from "next/image";
import { Quote, Newspaper, MapPin } from "lucide-react";
import { getTeam } from "@/lib/api";
import { AboutHero } from "@/components/about/AboutHero";
import { ValuesGrid } from "@/components/about/ValuesGrid";
import { CountUp } from "@/components/ui/CountUp";
import { Newsletter } from "@/components/home/Newsletter";

export const metadata: Metadata = {
  title: "About · Trip Sangam",
  description:
    "A small team of Nepali guides and itinerary designers building considered journeys across the Himalayan belt since 2018.",
};

const stats = [
  { value: 8, suffix: "yrs", label: "Quietly building" },
  { value: 47, suffix: "", label: "Local guides on payroll" },
  { value: 5416, suffix: "m", label: "Our highest pass" },
  { value: 120, suffix: "%", label: "Carbon offset, per trip" },
];

const press = [
  { name: "Lonely Planet", quote: "Genuinely small-group. Genuinely Nepali-owned.", year: "2025" },
  { name: "National Geographic", quote: "A model for considered adventure travel.", year: "2024" },
  { name: "Condé Nast Traveller", quote: "The team to book with for the Annapurnas.", year: "2024" },
  { name: "TripAdvisor", quote: "Travelers' Choice — top 1% worldwide.", year: "2023–25" },
];

export default async function AboutPage() {
  const team = await getTeam();
  return (
    <>
      <AboutHero />

      {/* Story */}
      <section className="mx-auto max-w-4xl px-5 py-20 md:px-8 md:py-28">
        <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-crimson">
          <span className="h-px w-8 bg-crimson" /> Our story
        </p>
        <h2 className="balance mt-3 font-serif text-4xl tracking-tight md:text-5xl">
          We started this so a friend could
          <span className="italic text-crimson"> guide on his own terms.</span>
        </h2>
        <div className="mt-10 space-y-6 text-base leading-relaxed text-muted md:text-lg">
          <p>
            In 2018, our founder Sajan was working out of a small office in Thamel for an agency that booked
            120-person treks. The guides were paid weekly, in cash, often late. Porters were hired on the
            morning of departure with no insurance and no warm gear. The trips were profitable. They were also
            quietly grim.
          </p>
          <p>
            Sajan left, called a guide named Pemba Sherpa, and asked a single question: <em>what would you do
            if you ran the company?</em> Pemba had a list. Group caps at eight. Porters on monthly salaries with
            health insurance. Acclimatisation days that were truly rest days, not "optional" hikes. A 12-week
            training plan emailed to every client on booking, free.
          </p>
          <p>
            We started with three itineraries, four guides, and one truck. Seven years later we run a dozen
            departures a month across five regions, employ 47 guides and porters on full salary, and have planted
            two community forests along the Annapurna and Langtang trails. We're still small, on purpose.
          </p>
        </div>

        <blockquote className="my-14 border-l-2 border-crimson pl-6">
          <Quote className="h-6 w-6 text-crimson/40" />
          <p className="pretty mt-3 font-serif text-2xl italic leading-snug text-ink md:text-3xl">
            The job of a tour operator is to be quietly responsible for someone else's holiday. Everything else
            is decoration.
          </p>
          <footer className="mt-3 text-sm uppercase tracking-wider text-muted">
            — Sajan Shrestha, Founder
          </footer>
        </blockquote>
      </section>

      {/* Stats */}
      <section className="border-y border-line bg-white py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <div className="grid grid-cols-2 gap-y-10 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-serif text-4xl tracking-tight md:text-5xl">
                  <CountUp to={s.value} suffix={s.suffix} />
                </p>
                <p className="mt-1.5 text-xs uppercase tracking-[0.18em] text-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <ValuesGrid />

      {/* Team */}
      <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-crimson">
            <span className="h-px w-8 bg-crimson" /> The team
          </p>
          <h2 className="balance mt-3 font-serif text-4xl tracking-tight md:text-5xl">
            People who grew up in the mountains
            <span className="italic text-crimson"> you're flying for.</span>
          </h2>
          <p className="pretty mt-4 text-muted">
            Every itinerary is led by a NMA-certified Nepali guide, paid a monthly salary, with full health
            and rescue insurance. Meet a few.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((m) => (
            <article key={m.slug} className="group min-w-0 overflow-hidden rounded-3xl border border-line/70 bg-white shadow-soft transition-shadow hover:shadow-lift">
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src={m.photo}
                  alt={m.name}
                  fill
                  sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/70 to-transparent p-4 text-white">
                  <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/80">{m.role}</p>
                  <h3 className="mt-1 font-serif text-xl leading-tight">{m.name}</h3>
                </div>
              </div>
              <div className="space-y-3 p-5">
                <div className="flex items-center gap-1.5 text-xs text-muted">
                  <MapPin className="h-3 w-3" /> {m.region}
                  <span className="text-ink/20">·</span>
                  <span className="font-mono">{m.yearsExperience}y</span>
                </div>
                <p className="pretty line-clamp-4 text-sm leading-relaxed text-muted">{m.bio}</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {m.languages.map((l) => (
                    <span key={l} className="rounded-full bg-sand px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-ink">
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Press */}
      <section className="bg-white py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-crimson">
              <span className="h-px w-8 bg-crimson" /> In the press
            </p>
            <h2 className="balance mt-3 font-serif text-4xl tracking-tight md:text-5xl">
              Quietly recommended<span className="italic text-crimson"> by the people who know.</span>
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {press.map((p) => (
              <figure key={p.name} className="min-w-0 rounded-3xl border border-line/70 bg-sand p-6">
                <Newspaper className="h-5 w-5 text-crimson" />
                <blockquote className="pretty mt-4 font-serif text-lg italic leading-snug text-ink">
                  "{p.quote}"
                </blockquote>
                <figcaption className="mt-4 text-xs uppercase tracking-wider text-muted">
                  {p.name} · <span className="font-mono">{p.year}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <Newsletter />
    </>
  );
}
