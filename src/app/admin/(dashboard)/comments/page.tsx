import Link from "next/link";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { deleteComment } from "@/actions/comments";

export default async function AdminCommentsPage() {
	const comments = await prisma.comment.findMany({
		orderBy: { createdAt: "desc" },
		include: {
			author: { select: { name: true, email: true } },
			post: { select: { title: true, slug: true } },
		},
	});

	return (
		<div>
			<h1 className="font-serif text-2xl font-semibold text-foreground">
				Comments
			</h1>

			{comments.length === 0 ? (
				<p className="mt-8 text-muted-foreground">No comments yet.</p>
			) : (
				<ul className="mt-8 divide-y divide-border border-t border-border">
					{comments.map((comment) => (
						<li key={comment.id} className="py-5">
							<div className="flex items-start justify-between gap-6">
								<div className="min-w-0">
									<p className="font-mono text-xs text-muted-foreground">
										{comment.author.name ?? comment.author.email}
										{" · "}
										{format(comment.createdAt, "MMM d, yyyy")}
										{" · on "}
										<Link href={`/blog/${comment.post.slug}`}>
											{comment.post.title}
										</Link>
									</p>
									<p className="mt-2 whitespace-pre-wrap text-foreground">
										{comment.content}
									</p>
								</div>
								<form action={deleteComment.bind(null, comment.id)}>
									<button
										type="submit"
										className="shrink-0 text-sm text-muted-foreground hover:text-red-700">
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
