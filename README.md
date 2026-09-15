# Marginalia — a full-stack blog & CMS

A blog with a complete admin CMS, built to exercise the Next.js App Router end to end:
Server Components, Server Actions, static generation with ISR, streaming with Suspense,
role-based auth, and a relational database.

## Stack

| Layer      | Choice                                             |
| ---------- | -------------------------------------------------- |
| Framework  | Next.js 16 (App Router, Turbopack)                 |
| Language   | TypeScript                                         |
| Database   | Neon (serverless Postgres)                         |
| ORM        | Prisma 7 (driver adapter: `@prisma/adapter-neon`)  |
| Auth       | Auth.js v5 (credentials, JWT sessions, role-based) |
| Styling    | Tailwind CSS v4 (CSS-first `@theme` config)        |
| Markdown   | react-markdown + remark-gfm                        |
| Validation | Zod                                                |

Requires Node.js 20.9+.

## Features

**Public**

- Post index with cover thumbnails, dates, and reading time
- Post pages at `/blog/[slug]` — statically generated, revalidated every 60s
- Tag archives at `/tags/[slug]`, also statically generated
- Full-text-ish search via `?q=`, debounced and URL-driven so results are shareable
- Comments: sign in to post, delete your own
- Reader registration and sign-in
- SEO: per-post metadata, dynamic Open Graph images, `sitemap.xml`, `robots.txt`

**Admin** (`/admin`, ADMIN role only)

- Dashboard listing all posts with draft/published state and comment counts
- Create / edit / delete posts, with markdown body, tags, excerpt, and cover image upload
- One-click publish / unpublish
- Comment moderation across all posts

## Architecture notes

A few decisions worth reading the code for:

- **Static article, dynamic comments.** Reading the session touches cookies, which would
  force the whole post page to render per-request. Comments live in a separate async
  server component wrapped in `<Suspense>`, so the article stays statically cached while
  the comment block renders dynamically and streams in.
- **Auth is checked twice, deliberately.** `proxy.ts` guards page navigation, but Server
  Actions are POST endpoints that can be invoked directly — so every mutating action
  re-verifies the session itself rather than trusting the route guard.
- **Route groups separate concerns.** `(public)` and `(admin)` have independent layouts;
  `/admin/login` sits outside the guarded `(dashboard)` group so the guard can't redirect
  it to itself.
- **Mutations revalidate precisely.** Actions call `revalidatePath` for the affected post,
  the index, and the dashboard, so published changes appear immediately rather than after
  the 60s ISR window.

## Setup

1. **Install**

   ```bash
   npm install
   ```

2. **Create a Neon project** at https://neon.tech and add a database.

3. **Get connection strings.** In the Neon Console, open your project → **Connect**.
   - Connection pooling **on** → copy → this is `DATABASE_URL` (hostname contains `-pooler`)
   - Connection pooling **off** → copy → this is `DIRECT_URL`

   The app queries through the pooled URL; the Prisma CLI needs the direct one, because
   Neon's pooler doesn't support the session-level operations migrations require.

4. **Configure env**

   ```bash
   cp .env.example .env
   npx auth secret
   ```

   Paste both connection strings into `.env`.

5. **Set up the database**

   ```bash
   npm run prisma:generate
   npx prisma migrate dev --name init
   npm run prisma:seed
   ```

6. **Run**
   ```bash
   npm run dev
   ```
   Seeded admin: `admin@example.com` / `admin1234` — change this before exposing the site.

## Project structure

```
src/
├── app/
│   ├── (public)/          # blog index, posts, tags, login, register
│   ├── (admin)/admin/     # login + (dashboard) group: posts, comments
│   ├── api/               # auth handler, image upload
│   ├── sitemap.ts
│   └── robots.ts
├── actions/               # Server Actions: posts, comments, auth
├── components/            # shared UI
├── lib/                   # prisma client, auth config, queries, site config
└── proxy.ts               # route guard (Next.js 16's renamed middleware)
```

## Known limitations

These are deliberate scope choices, not oversights:

- **Uploads write to local disk** (`public/uploads`). Fine for development or a host with
  a persistent filesystem; on ephemeral/serverless hosts these files vanish on redeploy.
  `src/app/api/upload/route.ts` marks the single line to swap for S3, Vercel Blob,
  UploadThing, or Cloudinary.
- **Deleted posts leave orphaned image files** on disk. A real deployment would clean these
  up in the delete action or with a periodic job.
- **Search uses `ILIKE`**, which scans. Fine at this scale; Postgres full-text search
  (`tsvector` + GIN index) is the upgrade path once the post count grows.
- **No email verification or password reset.** Credentials auth is intentionally minimal;
  adding an OAuth provider is a few lines in `src/lib/auth.ts`.
