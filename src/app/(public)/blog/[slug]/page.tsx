import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Metadata } from "next";
import { getPostBySlug, getAllPublishedSlugs, readingTime } from "@/lib/posts";
import { CommentsSection } from "@/components/comments-section";

export const revalidate = 60;

export async function generateStaticParams() {
	const slugs = await getAllPublishedSlugs();
	return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const { slug } = await params;
	const post = await getPostBySlug(slug);
	if (!post) return {};

	return {
		title: post.title,
		description: post.excerpt ?? undefined,
		openGraph: {
			title: post.title,
			description: post.excerpt ?? undefined,
			type: "article",
			publishedTime: post.publishedAt?.toISOString(),
			images: post.coverImage ? [post.coverImage] : undefined,
		},
	};
}

export default async function PostPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const post = await getPostBySlug(slug);

	if (!post) notFound();

	return (
		<article className="mx-auto max-w-2xl px-6 py-12">
			<Link
				href="/"
				className="text-sm text-muted-foreground no-underline hover:text-accent">
				← All posts
			</Link>

			<h1 className="mt-6 font-serif text-4xl font-semibold leading-tight text-foreground">
				{post.title}
			</h1>

			<p className="mt-4 font-mono text-sm text-muted-foreground">
				{post.publishedAt ? format(post.publishedAt, "MMMM d, yyyy") : ""}
				{" · "}
				{readingTime(post.content)}
				{post.author.name ? ` · ${post.author.name}` : ""}
			</p>

			{post.coverImage && (
				/* eslint-disable-next-line @next/next/no-img-element */
				<img
					src={post.coverImage}
					alt=""
					className="mt-8 w-full rounded-md border border-border object-cover"
				/>
			)}

			<div className="prose-post prose mt-10 text-foreground">
				<ReactMarkdown remarkPlugins={[remarkGfm]}>
					{post.content}
				</ReactMarkdown>
			</div>

			{post.tags.length > 0 && (
				<div className="mt-10 flex gap-3 border-t border-border pt-6 text-sm text-muted-foreground">
					{post.tags.map((tag) => (
						<span key={tag.id}>{tag.name}</span>
					))}
				</div>
			)}

			<section className="mt-12 border-t border-border pt-8">
				<Suspense
					fallback={<p className="text-muted-foreground">Loading comments…</p>}>
					<CommentsSection postId={post.id} postSlug={post.slug} />
				</Suspense>
			</section>
		</article>
	);
}
