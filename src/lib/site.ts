/** Single source of truth for site-level values used by metadata and SEO. */

export const siteName = "Marginalia";

export const siteDescription =
  "Notes on building things — mostly Next.js, mostly whatever broke and got fixed along the way.";

/**
 * Absolute base URL, needed for canonical links, sitemap entries, and
 * Open Graph image URLs (which must be absolute).
 * Set NEXT_PUBLIC_SITE_URL in production; falls back to localhost in dev.
 */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
