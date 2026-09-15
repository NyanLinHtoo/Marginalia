import Link from "next/link";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { deletePost, togglePublish } from "@/actions/posts";

export default async function AdminDashboardPage() {
	const posts = await prisma.post.findMany({
		orderBy: { createdAt: "desc" },
		include: { _count: { select: { comments: true } } },
	});

	return (
		<div>
			<div className="flex items-center justify-between">
				<h1 className="font-serif text-2xl font-semibold text-foreground">
					Posts
				</h1>
				<Link
					href="/admin/posts/new"
					className="rounded-md bg-foreground px-4 py-2 text-sm text-background no-underline">
					New post
				</Link>
			</div>

			{posts.length === 0 ? (
				<p className="mt-8 text-muted-foreground">No posts yet.</p>
			) : (
				<ul className="mt-8 divide-y divide-border border-t border-border">
					{posts.map((post) => (
						<li
							key={post.id}
							className="flex items-center justify-between py-4">
							<div>
								<p className="font-medium text-foreground">{post.title}</p>
								<p className="mt-1 font-mono text-xs text-muted-foreground">
									{post.published ? "Published" : "Draft"}
									{post.publishedAt
										? ` · ${format(post.publishedAt, "MMM d, yyyy")}`
										: ""}
									{` · ${post._count.comments} comments`}
								</p>
							</div>
							<div className="flex items-center gap-4 text-sm">
								<Link
									href={`/admin/posts/${post.id}/edit`}
									className="text-accent no-underline">
									Edit
								</Link>
								<form action={togglePublish.bind(null, post.id)}>
									<button
										type="submit"
										className="text-muted-foreground hover:text-accent">
										{post.published ? "Unpublish" : "Publish"}
									</button>
								</form>
								<form action={deletePost.bind(null, post.id)}>
									<button
										type="submit"
										className="text-muted-foreground hover:text-red-700">
										Delete
									</button>
								</form>
							</div>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
