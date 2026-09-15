/** @type {import('postcss-load-config').Config} */
const config = {
	plugins: {
		// Tailwind v4 ships its own PostCSS plugin package; autoprefixer and a
		// separate `tailwindcss` PostCSS plugin are no longer needed.
		"@tailwindcss/postcss": {},
	},
};

export default config;
