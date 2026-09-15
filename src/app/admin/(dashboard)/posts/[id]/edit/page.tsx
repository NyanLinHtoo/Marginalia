import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PostForm } from "@/components/post-form";
import { updatePost, deletePost } from "@/actions/posts";

export default async function EditPostPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const post = await prisma.post.findUnique({
		where: { id },
		include: { tags: true },
	});

	if (!post) notFound();

	const updateWithId = updatePost.bind(null, post.id);

	return (
		<div>
			<div className="flex items-center justify-between">
				<h1 className="font-serif text-2xl font-semibold text-foreground">
					Edit post
				</h1>
				<form action={deletePost.bind(null, post.id)}>
					<button
						type="submit"
						className="text-sm text-muted-foreground hover:text-red-700">
						Delete post
					</button>
				</form>
			</div>

			<PostForm
				action={updateWithId}
				submitLabel="Save changes"
				defaultValues={{
					title: post.title,
					slug: post.slug,
					excerpt: post.excerpt ?? "",
					content: post.content,
					tags: post.tags.map((t) => t.name).join(", "),
					coverImage: post.coverImage ?? "",
					published: post.published,
				}}
			/>
		</div>
	);
}
