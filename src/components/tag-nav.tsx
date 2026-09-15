import Link from "next/link";

type TagItem = { id: string; name: string; slug: string; count: number };

export function TagNav({
  tags,
  activeSlug,
}: {
  tags: TagItem[];
  activeSlug?: string;
}) {
  if (tags.length === 0) return null;

  return (
    <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
      <Link
        href="/"
        className={
          activeSlug
            ? "text-muted-foreground no-underline hover:text-accent"
            : "font-medium text-foreground no-underline"
        }
      >
        All
      </Link>
      {tags.map((tag) => (
        <Link
          key={tag.id}
          href={`/tags/${tag.slug}`}
          className={
            activeSlug === tag.slug
              ? "font-medium text-foreground no-underline"
              : "text-muted-foreground no-underline hover:text-accent"
          }
        >
          {tag.name}{" "}
          <span className="font-mono text-xs text-muted-foreground">{tag.count}</span>
        </Link>
      ))}
    </nav>
  );
}
