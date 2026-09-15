import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
	schema: "prisma/schema.prisma",
	migrations: {
		path: "prisma/migrations",
		seed: "tsx prisma/seed.ts",
	},
	datasource: {
		// The Prisma CLI (migrate, studio, db push, seed) needs a direct
		// connection, not the pooled one — Neon's pooler doesn't support the
		// session-level operations migrations require.
		url: env("DIRECT_URL"),
	},
});
