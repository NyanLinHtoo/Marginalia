import Link from "next/link";
import { format } from "date-fns";
import { readingTime } from "@/lib/posts";

type PostListItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  publishedAt: Date | null;
  tags: { id: string; name: string; slug: string }[];
};

export function PostList({
  posts,
  emptyMessage = "Nothing published yet. Check back soon.",
}: {
  posts: PostListItem[];
  emptyMessage?: string;
}) {
  if (posts.length === 0) {
    return <p className="text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <ol className="divide-y divide-border border-t border-border">
      {posts.map((post) => (
        <li key={post.id} className="py-8">
          <Link href={`/blog/${post.slug}`} className="group block no-underline">
            {post.coverImage && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={post.coverImage}
                alt=""
                className="mb-4 h-40 w-full rounded-md border border-border object-cover"
              />
            )}
            <p className="font-mono text-sm text-muted-foreground">
              {post.publishedAt ? format(post.publishedAt, "MMM d, yyyy") : ""}
              {" · "}
              {readingTime(post.content)}
            </p>
            <h2 className="mt-2 font-serif text-2xl font-semibold text-foreground group-hover:text-accent">
              {post.title}
            </h2>
            {post.excerpt && (
              <p className="mt-2 text-muted-foreground">{post.excerpt}</p>
            )}
          </Link>

          {post.tags.length > 0 && (
            <p className="mt-3 flex flex-wrap gap-x-3 text-sm">
              {post.tags.map((tag) => (
                <Link key={tag.id} href={`/tags/${tag.slug}`}>
                  {tag.name}
                </Link>
              ))}
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}
