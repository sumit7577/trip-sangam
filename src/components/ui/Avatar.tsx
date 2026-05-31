import Image from "next/image";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Round avatar that falls back to a person placeholder icon when no
 * image is available (e.g. a review/testimonial without an uploaded
 * photo). `className` controls the rendered size (e.g. "h-12 w-12").
 */
export function Avatar({
  src,
  alt,
  size,
  className,
}: {
  src?: string | null;
  alt: string;
  size: number;
  className?: string;
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        className={cn("rounded-full object-cover", className)}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={alt}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-ink/8 text-muted",
        className,
      )}
    >
      <User className="h-1/2 w-1/2" strokeWidth={1.75} aria-hidden />
    </div>
  );
}
