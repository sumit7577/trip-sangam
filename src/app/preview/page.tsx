import { Hero } from "@/components/home/Hero";
import { StatsStrip } from "@/components/home/StatsStrip";
import { FeaturedPackages } from "@/components/home/FeaturedPackages";
import { Testimonials } from "@/components/home/Testimonials";
import { HeroSlider } from "@/components/detail/HeroSlider";
import { JourneyMap } from "@/components/detail/JourneyMap";
import { PackageHeader } from "@/components/detail/PackageHeader";
import { BookingCard } from "@/components/detail/BookingCard";
import { TabsSection } from "@/components/detail/TabsSection";
import { getPackages, getTeamBySlug } from "@/lib/api";
import type {
  BlogPost,
  Package,
  PackageDetail,
  TeamMember,
  Testimonial,
} from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface PreviewSearchParams {
  type?: string;
  id?: string;
  token?: string;
}

type PreviewPayload =
  | ({ _type: "homepage" } & {
      heroEyebrow: string;
      heroTitle: string;
      heroSubtitle: string;
      heroImage: string;
      stats: { value: string; label: string }[];
      featuredPackages: Package[];
      testimonials: Testimonial[];
    })
  | ({ _type: "package" } & PackageDetail)
  | ({ _type: "blogpost" } & BlogPost)
  | { _type: "info" | "unknown"; title?: string; message?: string; detail?: string };

export default async function PreviewPage({
  searchParams,
}: {
  searchParams: PreviewSearchParams;
}) {
  const { type, id, token } = searchParams;
  if (!type || !id || !token) {
    return (
      <PreviewError
        title="Missing preview parameters"
        detail="Expected ?type=…&id=…&token=… — open this page from the Wagtail Preview button."
      />
    );
  }

  const url = `${API}/api/preview/?type=${encodeURIComponent(type)}&id=${encodeURIComponent(id)}&token=${encodeURIComponent(token)}`;
  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    const body = await res.text();
    return (
      <PreviewError title={`Preview API returned ${res.status}`} detail={body.slice(0, 500)} />
    );
  }

  const data = (await res.json()) as PreviewPayload;

  switch (data._type) {
    case "homepage":
      return <HomepagePreview data={data} />;
    case "package":
      return <PackagePreview data={data} />;
    case "blogpost":
      return <BlogPostPreview data={data} />;
    case "info":
      return (
        <PreviewInfo
          title={data.title ?? "Preview"}
          message={data.message ?? "No preview available."}
        />
      );
    default:
      return (
        <PreviewError
          title="Unknown content type"
          detail={data.detail ?? `_type was "${(data as { _type: string })._type}"`}
        />
      );
  }
}

// ─── Homepage preview ──────────────────────────────────────────────────────

async function HomepagePreview({
  data,
}: {
  data: Extract<PreviewPayload, { _type: "homepage" }>;
}) {
  // Hero search bar wants the full packages list, not just featured.
  const allPackages = await getPackages();
  return (
    <>
      <PreviewBanner mode="HOMEPAGE" />
      <Hero
        packages={allPackages}
        eyebrow={data.heroEyebrow}
        title={data.heroTitle}
        subtitle={data.heroSubtitle}
        imageUrl={data.heroImage}
      />
      <StatsStrip />
      <FeaturedPackages
        packages={data.featuredPackages.length > 0 ? data.featuredPackages : allPackages}
      />
      <Testimonials testimonials={data.testimonials} />
    </>
  );
}

// ─── Package preview ───────────────────────────────────────────────────────

function PackagePreview({
  data,
}: {
  data: Extract<PreviewPayload, { _type: "package" }>;
}) {
  const pkg = data;
  const images = pkg.galleryImages.length > 0 ? pkg.galleryImages : [pkg.heroImage];

  return (
    <>
      <PreviewBanner mode="PACKAGE" />
      <div className="h-[var(--header-h)]" />
      <HeroSlider images={images.slice(0, 6)} title={pkg.name} />
      <PackageHeader pkg={pkg} />
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          <div className="min-w-0 md:col-span-8">
            <TabsSection pkg={pkg} />
          </div>
          <div className="hidden min-w-0 md:col-span-4 md:block">
            <div className="md:sticky md:top-[calc(var(--header-h)+24px)]">
              <BookingCard pkg={pkg} />
            </div>
          </div>
        </div>
      </div>
      {pkg.journey.length > 0 && <JourneyMap stops={pkg.journey} />}
    </>
  );
}

// ─── Blog post preview ─────────────────────────────────────────────────────

async function BlogPostPreview({
  data,
}: {
  data: Extract<PreviewPayload, { _type: "blogpost" }>;
}) {
  const authorsBySlug = await getTeamBySlug();
  const author: TeamMember | undefined = authorsBySlug[data.authorSlug];
  return (
    <>
      <PreviewBanner mode="BLOG POST" />
      <div className="h-[var(--header-h)]" />
      <header className="mx-auto max-w-4xl px-5 py-12 md:px-8 md:py-16">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
          {data.category} · {data.date} · {data.readingTime} min read
        </p>
        <h1 className="balance mt-4 font-serif text-4xl leading-[1.05] tracking-tight md:text-6xl">
          {data.title}
        </h1>
        <p className="pretty mt-6 text-lg leading-relaxed text-muted md:text-xl">
          {data.excerpt}
        </p>
        {author && (
          <p className="mt-6 text-sm text-muted">
            By <span className="font-medium text-ink">{author.name}</span> · {author.role}
          </p>
        )}
      </header>
      <article className="mx-auto max-w-3xl px-5 pb-20 md:px-8">
        <div className="space-y-6 font-serif text-lg leading-relaxed text-ink md:text-xl">
          {data.body.map((para, i) => (
            <p key={i} className="pretty">
              {para}
            </p>
          ))}
        </div>
        {data.pullQuote && (
          <blockquote className="my-12 border-l-2 border-crimson pl-6">
            <p className="font-serif text-2xl italic leading-snug text-ink md:text-3xl">
              "{data.pullQuote}"
            </p>
          </blockquote>
        )}
      </article>
    </>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function PreviewBanner({ mode }: { mode: string }) {
  return (
    <div className="sticky top-0 z-[100] flex items-center justify-center gap-2 bg-gold/90 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-ink shadow-soft backdrop-blur">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink" />
      Preview · {mode} · unsaved draft
    </div>
  );
}

function PreviewError({ title, detail }: { title: string; detail?: string }) {
  return (
    <div className="mx-auto max-w-2xl px-5 py-32 md:px-8">
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-crimson">Preview error</p>
      <h1 className="mt-3 font-serif text-3xl">{title}</h1>
      {detail && (
        <pre className="mt-6 overflow-x-auto rounded-2xl border border-line bg-sand p-4 text-xs leading-relaxed text-muted">
          {detail}
        </pre>
      )}
    </div>
  );
}

function PreviewInfo({ title, message }: { title: string; message: string }) {
  return (
    <div className="mx-auto max-w-2xl px-5 py-32 md:px-8">
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted">Preview</p>
      <h1 className="mt-3 font-serif text-3xl">{title}</h1>
      <p className="pretty mt-4 leading-relaxed text-muted">{message}</p>
    </div>
  );
}
