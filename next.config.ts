import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			// Add your image host(s) here once you wire up UploadThing / Vercel Blob, e.g.:
			// { protocol: "https", hostname: "utfs.io" },
		],
	},
	// Stable as of Next.js 15.5+ — top-level, not under `experimental` anymore.
	typedRoutes: true,
	// Turbopack is the default bundler in Next.js 16 for both dev and build;
	// no flags needed. This object is only for Turbopack-specific overrides.
	turbopack: {},
	// Opt-in later if you want per-component/page caching with `"use cache"`:
	// cacheComponents: true,
};

export default nextConfig;
