import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col justify-center px-6">
      <p className="font-mono text-sm text-muted-foreground">404</p>
      <h1 className="mt-2 font-serif text-3xl font-semibold text-foreground">
        That page doesn&apos;t exist
      </h1>
      <p className="mt-3 text-muted-foreground">
        The post may have been unpublished, renamed, or never existed.
      </p>
      <p className="mt-6">
        <Link href="/">← Back to all posts</Link>
      </p>
    </div>
  );
}
