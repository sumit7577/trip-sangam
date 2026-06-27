import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Clock, ArrowUpRight, MountainSnow } from "lucide-react";
import { getBlogPost, getBlogPosts, getTeamBySlug } from "@/lib/api";
import { pageMeta } from "@/lib/seo";

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getBlogPost(params.slug);
  if (!post) return { title: "Not found", robots: { index: false, follow: false } };
  return pageMeta({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}/`,
    image: post.coverImage,
  });
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const [post, posts, authorsBySlug] = await Promise.all([
    getBlogPost(params.slug),
    getBlogPosts(),
    getTeamBySlug(),
  ]);
  if (!post) notFound();
  const author = authorsBySlug[post.authorSlug];
  const related = posts.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <>
      <div className="h-[var(--header-h)]" />

      {/* Cover */}
      <header className="relative isolate w-full overflow-hidden">
        <div className="relative h-[58vh] w-full md:h-[68vh]">
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-ink/80 to-ink">
              <MountainSnow className="h-16 w-16 text-white/15" strokeWidth={1} />
            </div>
          )}
          <div className="absolute inset-0 bg-ink/50" />
        </div>

        <div className="absolute inset-0">
          <div className="mx-auto flex h-full max-w-4xl flex-col items-start justify-end px-5 pb-10 text-white md:px-8 md:pb-16">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.18em] backdrop-blur transition-colors hover:bg-white/20"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Field notes
            </Link>
            <p className="mt-6 inline-flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-white/75">
              <span className="rounded-full bg-white/15 px-2.5 py-0.5">{post.category}</span>
              <time dateTime={post.isoDate}>{post.date}</time>
              <span className="text-white/40">·</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" /> {post.readingTime} min read
              </span>
            </p>
            <h1 className="balance mt-5 max-w-3xl font-serif text-[clamp(2.25rem,6vw,4.5rem)] font-light leading-[1] tracking-tight">
              {post.title}
            </h1>
          </div>
        </div>
      </header>

      {/* Author strip */}
      {author && (
        <section className="border-b border-line bg-white">
          <div className="mx-auto flex max-w-4xl items-center gap-4 px-5 py-5 md:px-8">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full">
              <Image src={author.photo} alt={author.name} fill sizes="48px" className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">{author.name}</p>
              <p className="truncate text-xs text-muted">
                {author.role} · {author.region}
              </p>
            </div>
            <Link
              href="/about"
              className="hidden shrink-0 text-xs font-medium text-muted underline-offset-4 hover:text-ink hover:underline sm:inline"
            >
              Meet the team →
            </Link>
          </div>
        </section>
      )}

      {/* Body */}
      <article className="mx-auto max-w-3xl px-5 py-14 md:px-8 md:py-20">
        <div className="space-y-6 font-serif text-lg leading-relaxed text-ink md:text-xl">
          <p className="pretty text-xl text-muted md:text-2xl">{post.excerpt}</p>
          {post.body.map((para, i) => (
            <p key={i} className="pretty">
              {para}
            </p>
          ))}
        </div>

        {post.pullQuote && (
          <blockquote className="my-12 border-l-2 border-crimson pl-6">
            <p className="font-serif text-2xl italic leading-snug text-ink md:text-3xl">
              "{post.pullQuote}"
            </p>
            {author && (
              <footer className="mt-3 text-sm uppercase tracking-wider text-muted">— {author.name}</footer>
            )}
          </blockquote>
        )}

        {/* Author bio */}
        {author && (
          <div className="mt-16 rounded-3xl border border-line/70 bg-white p-6 md:p-8">
            <div className="flex items-start gap-4 md:gap-5">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl md:h-20 md:w-20">
                <Image src={author.photo} alt={author.name} fill sizes="80px" className="object-cover" />
              </div>
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">About the author</p>
                <h3 className="mt-1 font-serif text-xl text-ink">{author.name}</h3>
                <p className="text-xs text-muted">{author.role} · {author.region}</p>
                <p className="pretty mt-3 text-sm leading-relaxed text-muted">{author.bio}</p>
              </div>
            </div>
          </div>
        )}
      </article>

      {/* Related */}
      <section className="border-t border-line bg-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="mb-8 flex items-end justify-between gap-6">
            <h2 className="font-serif text-3xl tracking-tight md:text-4xl">Keep reading</h2>
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-ink transition-colors hover:text-crimson"
            >
              All field notes <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
            {related.map((p) => {
              const a = authorsBySlug[p.authorSlug];
              return (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="group flex min-w-0 flex-col overflow-hidden rounded-3xl border border-line/70 bg-sand shadow-soft transition-shadow hover:shadow-lift"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {p.coverImage ? (
                      <Image
                        src={p.coverImage}
                        alt={p.title}
                        fill
                        sizes="(max-width:768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-1000 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sand via-white to-line/40">
                        <MountainSnow className="h-9 w-9 text-ink/15" strokeWidth={1.2} />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-5">
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
                      {p.category} · {p.readingTime}m
                    </p>
                    <h3 className="font-serif text-lg leading-tight tracking-tight text-ink line-clamp-2">
                      {p.title}
                    </h3>
                    {a && <p className="mt-auto text-xs text-muted">{a.name} · {p.date}</p>}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
