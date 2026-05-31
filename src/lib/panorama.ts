// A stop's panorama can be either an equirectangular image (uploaded or a
// direct image URL — rendered with Photo Sphere Viewer) or an interactive
// embed such as a Google Maps Street View "embed" iframe URL. We render the
// latter in an <iframe> instead of loading the WebGL viewer.
const EMBED_RE =
  /(google\.[^/]+\/maps|\/maps\/embed|street.?view|matterport\.com|kuula\.co|momento360\.com\/p\/|\/embed\b)/i;

export function isEmbedPanorama(url: string): boolean {
  return EMBED_RE.test(url);
}
