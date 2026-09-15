import Link from "next/link";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { deleteComment } from "@/actions/comments";
import { CommentForm } from "@/components/comment-form";

/**
 * This component reads the session, which makes it request-time dynamic.
 * Keeping it separate (and wrapping it in <Suspense> on the page) lets the
 * article itself stay statically generated and cached.
 */
export async function CommentsSection({
	postId,
	postSlug,
}: {
	postId: string;
	postSlug: string;
}) {
	const [session, comments] = await Promise.all([
		auth(),
		prisma.comment.findMany({
			where: { postId },
			orderBy: { createdAt: "asc" },
			include: { author: { select: { name: true } } },
		}),
	]);

	const currentUser = session?.user as
		| { id?: string; role?: string }
		| undefined;

	return (
		<>
			<h2 className="font-serif text-xl font-semibold text-foreground">
				Comments {comments.length > 0 ? `(${comments.length})` : ""}
			</h2>

			{comments.length === 0 ? (
				<p className="mt-3 text-muted-foreground">
					No comments yet. Be the first.
				</p>
			) : (
				<ul className="mt-6 space-y-6">
					{comments.map((comment) => {
						const canDelete =
							currentUser?.role === "ADMIN" ||
							currentUser?.id === comment.authorId;

						return (
							<li key={comment.id} className="border-b border-border pb-6">
								<div className="flex items-baseline justify-between gap-4">
									<p className="text-sm font-medium text-foreground">
										{comment.author.name ?? "Anonymous"}
										<span className="ml-2 font-mono text-xs font-normal text-muted-foreground">
											{format(comment.createdAt, "MMM d, yyyy")}
										</span>
									</p>
									{canDelete && (
										<form action={deleteComment.bind(null, comment.id)}>
											<button
												type="submit"
												className="text-xs text-muted-foreground hover:text-red-700">
												Delete
											</button>
										</form>
									)}
								</div>
								<p className="mt-2 whitespace-pre-wrap text-muted-foreground">
									{comment.content}
								</p>
							</li>
						);
					})}
				</ul>
			)}

			{currentUser?.id ? (
				<CommentForm postId={postId} />
			) : (
				<p className="mt-6 text-sm text-muted-foreground">
					<Link href={`/login?from=/blog/${postSlug}`}>Sign in</Link> or{" "}
					<Link href="/register">create an account</Link> to leave a comment.
				</p>
			)}
		</>
	);
}
