import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";

// Seed scripts run outside the app, so they need their own adapter-backed
// client too — see src/lib/prisma.ts for the same pattern.
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// Picsum serves real photographs (sourced from Unsplash) at a stable URL per
// seed string, so re-running this script always yields the same image
// instead of a random one each time.
const cover = (seed: string) => `https://picsum.photos/seed/${seed}/1200/630`;

// Maps each tag's URL slug to how it should actually display.
const tagNames: Record<string, string> = {
	nextjs: "Next.js",
	"app-router": "App Router",
	"server-actions": "Server Actions",
	auth: "Auth",
	postgres: "Postgres",
	debugging: "Debugging",
	prisma: "Prisma",
	tailwindcss: "Tailwind CSS",
	css: "CSS",
};

type SeedPost = {
	title: string;
	slug: string;
	excerpt: string;
	content: string;
	tags: string[];
	coverSeed: string;
	daysAgo: number;
};

const posts: SeedPost[] = [
	{
		title: "Why I Rebuilt This Blog on the App Router",
		slug: "why-i-rebuilt-this-blog-on-the-app-router",
		excerpt:
			"Pages Router got me most of the way for years. Here's what actually pushed me to move, and what surprised me once I did.",
		coverSeed: "app-router",
		daysAgo: 28,
		tags: ["nextjs", "app-router"],
		content: `I put this off for a long time. The Pages Router worked, \`getStaticProps\` was easy to reason about, and "if it isn't broken" is a pretty strong argument when a blog is a side project competing with everything else in your life.

What finally moved me wasn't a single killer feature — it was three smaller things stacking up.

## Data fetching without the ceremony

In the Pages Router, every page needed a matching \`getStaticProps\` or \`getServerSideProps\` function, and passing data down meant threading props through however many components stood between the page and the thing that actually needed the data.

With Server Components, a component just fetches what it needs, where it needs it:

\`\`\`tsx
export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  // ...
}
\`\`\`

No prop drilling, no separate data-fetching function to keep in sync with the component that renders the result.

## Mutations that don't need an API route

Every form used to mean a matching \`/api\` route: parse the body, validate it, call the database, return JSON, then wire up \`fetch\` on the client with loading and error state by hand. Server Actions collapse that into one function:

\`\`\`ts
"use server";
export async function createPost(prevState: string | undefined, formData: FormData) {
  // validate, write to the database, redirect
}
\`\`\`

Point a \`<form action={...}>\` at it and you're done. The admin panel on this blog has zero traditional API routes for post management — just actions.

## What actually surprised me

The thing nobody's blog post mentioned: figuring out what should be a Server Component versus a Client Component took longer than I expected. The rule of thumb — start server, add \`"use client"\` only where you need interactivity or browser APIs — sounds simple until you're staring at a form that needs both a server-validated submission *and* client-side pending state. (The answer, it turns out, is \`useActionState\`: the action stays a Server Action, the component wrapping it becomes a client component.)

If you're on the fence: the migration is incremental. You can run \`app/\` and \`pages/\` side by side and move one route at a time. That's what made it feel low-risk enough to actually start.`,
	},
	{
		title: "Server Actions Are Just Functions (With a Catch)",
		slug: "server-actions-are-just-functions-with-a-catch",
		excerpt:
			"They look like regular async functions. They mostly behave like regular async functions. The gap between those two statements is where the interesting bugs live.",
		coverSeed: "functions",
		daysAgo: 19,
		tags: ["nextjs", "server-actions"],
		content: `The pitch for Server Actions is disarmingly simple: write a function, mark it \`"use server"\`, call it from a form or an event handler, and Next.js handles the network round-trip for you. For the most part, that's exactly how it feels to use them.

But "feels like a function call" and "is a function call" aren't the same thing, and the gap shows up in a few specific places.

## It's actually an RPC endpoint

Every Server Action compiles down to its own POST endpoint. That has real consequences:

- **It can be called directly**, not just from the form you attached it to. Anyone with the compiled action ID can send it a request. This is why every action in this project's \`src/actions/\` folder re-checks the session itself, instead of trusting that only an authenticated page could have triggered it.
- **Arguments are serialized**, not passed by reference. You can't hand an action a class instance or a function — only things that survive a trip through JSON (plus a few extras like \`Date\` and \`FormData\`, which Next.js handles specially).

## Binding arguments is a closure trick, not magic

Passing extra arguments looks like this:

\`\`\`tsx
<form action={deletePost.bind(null, post.id)}>
\`\`\`

That's plain JavaScript \`Function.prototype.bind\` — nothing Next.js-specific. It pre-fills \`post.id\` as the first argument, so when the form submits, only the \`FormData\` needs to travel as the remaining argument. Once you see it as "just \`bind\`," a lot of the pattern stops feeling like framework magic.

## The pending state isn't free

A plain \`async function\` called from a client component doesn't automatically show a loading spinner — you still need \`useActionState\` or \`useTransition\` to track that. The action itself has no concept of "pending"; that state lives entirely on the client, watching the promise.

## The part that actually bit me

Revalidation. \`revalidatePath\` only invalidates the *cache* — it doesn't re-render anything that isn't currently being viewed. I published a post, watched the admin dashboard update instantly, and then couldn't figure out why the homepage still showed stale data in another tab for a few seconds. That's expected — the other tab hadn't re-requested the page yet — but it's easy to read as a bug the first time you see it.

None of this is a knock on Server Actions. It's a genuinely good abstraction. It's just worth knowing where the abstraction is thin.`,
	},
	{
		title: "The Day Middleware Became Proxy",
		slug: "the-day-middleware-became-proxy",
		excerpt:
			"Next.js 16 renamed middleware.ts to proxy.ts. A rename sounds trivial until you notice what it's actually signaling about the runtime underneath it.",
		coverSeed: "renaming",
		daysAgo: 12,
		tags: ["nextjs", "auth"],
		content: `Somewhere between running \`npm run dev\` and reading the changelog, I found out \`middleware.ts\` doesn't exist anymore. Next.js 16 renamed it to \`proxy.ts\`, and the exported function goes from \`middleware\` to \`proxy\`.

My first reaction was mild annoyance — one more file to move. My second reaction, after actually reading why, was that this is a better name.

## "Middleware" never quite fit

In most frameworks, middleware means something that runs in a chain, mutating a request or response as it passes through — think Express middleware, stacked one after another. Next.js's version was never really that. It's a single file that intercepts a request *before* routing decides which page or route handler to run, and decides whether to let it through, redirect it, or rewrite it.

That's not a middleware chain. That's a proxy sitting in front of your app, making a routing decision. The new name just says what the file was already doing.

## The runtime change is the part that matters

This is the detail I almost missed: \`proxy.ts\` now runs on the **Node.js runtime by default**, not the Edge runtime middleware used to run on.

Practically, that means things that used to be awkward in \`middleware.ts\` — because the Edge runtime is a restricted subset of Node APIs — just work now. In this project, the guard in \`src/proxy.ts\` checks a session via Auth.js:

\`\`\`ts
export default auth((req) => {
  const session = req.auth;
  if (isAdminRoute && !session?.user) {
    return NextResponse.redirect(new URL("/admin/login", req.nextUrl.origin));
  }
});
\`\`\`

Under Edge, anything that pulled in a Node-only dependency deep in its call chain could break your middleware in confusing ways. Under Node.js, that whole category of problem mostly disappears.

## What I'd tell someone hitting this for the first time

If you're upgrading an existing project and see \`Module not found\` or routing that silently stops working after bumping to Next.js 16, check for a stray \`middleware.ts\` first. The rename is easy to miss because nothing in the error message points at it directly — the file just quietly stops being picked up.`,
	},
	{
		title: "Debugging a Silent Postgres Connection Pool Exhaustion",
		slug: "debugging-a-silent-postgres-connection-pool-exhaustion",
		excerpt:
			"Everything worked in dev. In production, requests started hanging with no errors, no logs, nothing. Here's how I tracked it down.",
		coverSeed: "debugging",
		daysAgo: 6,
		tags: ["postgres", "debugging", "prisma"],
		content: `The symptom was almost nothing: requests that should take 50ms were occasionally taking 30 seconds and then timing out. No error in the logs. No stack trace. Just silence, then a timeout.

## Ruling things out

First instinct was the database itself — maybe a slow query. I checked Neon's dashboard for slow query logs. Nothing. The queries that eventually completed were fast. It wasn't query performance; something was making requests *wait* before the query even started.

That's usually a connection problem.

## The actual cause

Each serverless function invocation was creating its own \`PrismaClient\`. Locally, with one long-running dev server, that's invisible — you get one client, one connection, reused forever. In production, with concurrent serverless invocations, each one opened its own connection to Postgres. Enough concurrent requests and I was exhausting Neon's connection limit; new requests just queued, waiting for a connection that wasn't coming, until they finally timed out.

The fix has two parts, both already baked into how this project's \`src/lib/prisma.ts\` is set up:

**1. Reuse the client across invocations in dev:**

\`\`\`ts
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
\`\`\`

This specifically fixes Next.js's dev-mode hot reload creating a fresh client on every file save — not the production issue, but the same category of "too many clients" problem, just triggered a different way.

**2. Use a pooled connection, not a direct one.**

This is the actual production fix. Neon's pooler (PgBouncer under the hood) sits in front of Postgres and multiplexes many logical client connections onto a much smaller number of real database connections. Pointing \`DATABASE_URL\` at the \`-pooler\` hostname, and reserving the direct connection (\`DIRECT_URL\`) only for Prisma's CLI migrations, means serverless concurrency doesn't translate 1:1 into database connections anymore.

## The lesson that generalizes

Silent hangs with no error message are almost always a *resource limit*, not a logic bug — connections, file handles, memory, rate limits. When something that should fail loudly instead just goes quiet, check what's finite before you check what's wrong.`,
	},
	{
		title: "Tailwind v4's CSS-First Config: What Actually Changed",
		slug: "tailwind-v4-css-first-config-what-actually-changed",
		excerpt:
			"No more tailwind.config.ts. Theme tokens live in CSS now. Here's what that buys you, and the one habit it breaks.",
		coverSeed: "css-theme",
		daysAgo: 2,
		tags: ["tailwindcss", "css"],
		content: `Upgrading this project to Tailwind v4 meant deleting a file I'd written dozens of times without thinking about: \`tailwind.config.ts\`. It's gone. Theme configuration now lives directly in CSS, using an \`@theme\` block.

Here's the whole theme for this blog:

\`\`\`css
@import "tailwindcss";

@theme {
  --color-background: #f7f6f1;
  --color-foreground: #1b1b16;
  --color-accent: #2b6e63;
  --font-serif: var(--font-serif), ui-serif, Georgia, serif;
}
\`\`\`

Every \`--color-*\` variable automatically becomes a utility class — \`--color-accent\` gives you \`bg-accent\`, \`text-accent\`, \`border-accent\`, no separate registration step. That's the part I like most: one declaration, not a JS object *and* a CSS variable to keep in sync.

## Why this is more than a syntax change

The old config was a JavaScript object evaluated at build time, then translated into CSS. That indirection meant tools, editors, and even Tailwind itself had to run a build step just to know what \`bg-accent\` referred to.

CSS custom properties are native. The browser understands them without any tooling at all, which means:

- They can be **read and changed at runtime** — genuinely useful for a dark mode toggle that doesn't require re-rendering everything, since the variables update in place.
- **DevTools shows real values**, not a compiled-away abstraction. Inspecting an element shows \`--color-accent: #2b6e63\` directly.

## The habit it breaks

If you're used to conditionally computing Tailwind config in JavaScript — reading an environment variable to pick a color scheme, say — that pattern doesn't translate directly anymore. CSS doesn't have conditionals. The v4-idiomatic answer is usually a \`.dark\` class (or \`prefers-color-scheme\`) that overrides the same variables, rather than computing different values before the CSS even exists.

For a project like this one, with a fixed, deliberately chosen palette, the migration was almost entirely deletion: remove \`tailwind.config.ts\`, move the color and font values into \`@theme\`, done. If you're maintaining a design system with genuinely dynamic theming, budget more time — the *mental model* shift matters more than the line count.`,
	},
];

async function main() {
	const passwordHash = await bcrypt.hash("admin1234", 10);

	const admin = await prisma.user.upsert({
		where: { email: "admin@example.com" },
		update: {},
		create: {
			email: "admin@example.com",
			name: "Admin",
			role: "ADMIN",
			password: passwordHash,
		},
	});

	for (const post of posts) {
		const publishedAt = new Date(
			Date.now() - post.daysAgo * 24 * 60 * 60 * 1000,
		);

		await prisma.post.upsert({
			where: { slug: post.slug },
			update: {},
			create: {
				title: post.title,
				slug: post.slug,
				excerpt: post.excerpt,
				content: post.content,
				coverImage: cover(post.coverSeed),
				published: true,
				publishedAt,
				authorId: admin.id,
				tags: {
					connectOrCreate: post.tags.map((slug) => ({
						where: { slug },
						create: { name: tagNames[slug] ?? slug, slug },
					})),
				},
			},
		});
	}

	console.log(`Seed complete: ${posts.length} posts.`);
	console.log("Admin login: admin@example.com / admin1234");
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
