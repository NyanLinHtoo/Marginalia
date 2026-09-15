import { Suspense } from "react";
import { getPublishedPosts, getTagsWithCounts } from "@/lib/posts";
import { PostList } from "@/components/post-list";
import { TagNav } from "@/components/tag-nav";
import { SearchInput } from "@/components/search-input";

export default async function HomePage({
	searchParams,
}: {
	searchParams: Promise<{ q?: string }>;
}) {
	const { q } = await searchParams;

	const [posts, tags] = await Promise.all([
		getPublishedPosts({ query: q }),
		getTagsWithCounts(),
	]);

	return (
		<div className="mx-auto max-w-2xl px-6 py-12">
			<p className="max-w-md text-muted-foreground">
				Notes on building things — mostly Next.js, mostly whatever broke and got
				fixed along the way.
			</p>

			<div className="mt-8 space-y-4">
				{/* useSearchParams needs a Suspense boundary during prerender. */}
				<Suspense
					fallback={
						<div className="h-[42px] rounded-md border border-border" />
					}>
					<SearchInput />
				</Suspense>
				<TagNav tags={tags} />
			</div>

			<div className="mt-10">
				{q && (
					<p className="mb-6 text-sm text-muted-foreground">
						{posts.length} {posts.length === 1 ? "result" : "results"} for “{q}”
					</p>
				)}
				<PostList
					posts={posts}
					emptyMessage={
						q
							? `No posts match “${q}”.`
							: "Nothing published yet. Check back soon."
					}
				/>
			</div>
		</div>
	);
}
