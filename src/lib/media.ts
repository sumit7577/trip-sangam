/**
 * The backend returns relative paths (e.g. "/media/sangam/...") for images
 * that were uploaded directly rather than pulled from an external URL (Bunny
 * CDN, Unsplash, etc. — those are already absolute). A relative path is only
 * meaningful resolved against the API origin, never the frontend's own
 * origin, so every image field coming back from the API needs this applied.
 */
export function mediaUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (/^https?:\/\//.test(path)) return path;
  const base = process.env.NEXT_PUBLIC_API_URL || "";
  return `${base}${path}`;
}
