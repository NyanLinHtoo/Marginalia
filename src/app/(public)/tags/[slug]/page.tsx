import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
	getPublishedPosts,
	getTagsWithCounts,
	getTagBySlug,
	getAllTagSlugs,
} from "@/lib/posts";
import { PostList } from "@/components/post-list";
import { TagNav } from "@/components/tag-nav";

export const revalidate = 60;

export async function generateStaticParams() {
	const slugs = await getAllTagSlugs();
	return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const { slug } = await params;
	const tag = await getTagBySlug(slug);
	if (!tag) return {};

	return {
		title: tag.name,
		description: `Posts tagged ${tag.name}.`,
	};
}

export default async function TagPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const tag = await getTagBySlug(slug);

	if (!tag) notFound();

	const [posts, tags] = await Promise.all([
		getPublishedPosts({ tag: slug }),
		getTagsWithCounts(),
	]);

	return (
		<div className="mx-auto max-w-2xl px-6 py-12">
			<h1 className="font-serif text-3xl font-semibold text-foreground">
				{tag.name}
			</h1>
			<p className="mt-2 text-muted-foreground">
				{posts.length} {posts.length === 1 ? "post" : "posts"} tagged {tag.name}
				.
			</p>

			<div className="mt-8">
				<TagNav tags={tags} activeSlug={slug} />
			</div>

			<div className="mt-10">
				<PostList
					posts={posts}
					emptyMessage={`No posts tagged ${tag.name} yet.`}
				/>
			</div>
		</div>
	);
}
