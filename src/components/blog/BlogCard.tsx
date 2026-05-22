"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Clock } from "lucide-react";
import type { BlogPost, TeamMember } from "@/types";

export function BlogCard({
  post,
  index,
  author,
}: {
  post: BlogPost;
  index: number;
  author?: TeamMember;
}) {

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ delay: (index % 3) * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="group h-full min-w-0"
    >
      <Link href={`/blog/${post.slug}`} className="block h-full">
        <motion.div
          whileHover={{ y: -6 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className="flex h-full flex-col overflow-hidden rounded-3xl border border-line/70 bg-white shadow-soft transition-shadow duration-500 group-hover:shadow-lift"
        >
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <span className="absolute left-4 top-4 inline-flex items-center rounded-full bg-white/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-ink shadow-soft backdrop-blur">
              {post.category}
            </span>
          </div>

          <div className="flex flex-1 flex-col gap-4 p-6">
            <h3 className="font-serif text-[22px] leading-[1.15] tracking-tight text-ink line-clamp-3">
              {post.title}
            </h3>
            <p className="pretty line-clamp-3 text-sm leading-relaxed text-muted">{post.excerpt}</p>

            <div className="flex-1" />

            <div className="flex items-end justify-between gap-3 border-t border-line pt-4">
              {author && (
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full">
                    <Image src={author.photo} alt={author.name} fill sizes="36px" className="object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-ink">{author.name}</p>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-muted">{post.date}</p>
                  </div>
                </div>
              )}
              <span className="inline-flex shrink-0 items-center gap-1 font-mono text-[11px] text-muted">
                <Clock className="h-3 w-3" />
                {post.readingTime}m
                <ArrowUpRight className="ml-2 h-3.5 w-3.5 text-ink opacity-0 transition-opacity group-hover:opacity-100" />
              </span>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.article>
  );
}
