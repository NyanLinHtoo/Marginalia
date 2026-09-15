"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const commentSchema = z.object({
	content: z
		.string()
		.trim()
		.min(1, "Comment can't be empty.")
		.max(2000, "Comment is too long (2000 characters max)."),
});

/** Readers post comments; any signed-in user qualifies. */
export async function addComment(
	postId: string,
	_prevState: string | undefined,
	formData: FormData,
): Promise<string | undefined> {
	const session = await auth();
	const userId = (session?.user as { id?: string } | undefined)?.id;

	if (!userId) {
		return "You need to be signed in to comment.";
	}

	const parsed = commentSchema.safeParse({ content: formData.get("content") });
	if (!parsed.success) {
		return parsed.error.issues[0]?.message ?? "Invalid comment.";
	}

	const post = await prisma.post.findUnique({
		where: { id: postId },
		select: { slug: true, published: true },
	});

	if (!post?.published) {
		return "This post isn't accepting comments.";
	}

	await prisma.comment.create({
		data: { content: parsed.data.content, postId, authorId: userId },
	});

	revalidatePath(`/blog/${post.slug}`);
}

/** Comment authors can delete their own; admins can delete any. */
export async function deleteComment(commentId: string) {
	const session = await auth();
	const user = session?.user as { id?: string; role?: string } | undefined;

	if (!user?.id) {
		throw new Error("Not authorized.");
	}

	const comment = await prisma.comment.findUniqueOrThrow({
		where: { id: commentId },
		include: { post: { select: { slug: true } } },
	});

	if (user.role !== "ADMIN" && comment.authorId !== user.id) {
		throw new Error("Not authorized.");
	}

	await prisma.comment.delete({ where: { id: commentId } });

	revalidatePath(`/blog/${comment.post.slug}`);
	revalidatePath("/admin/comments");
}
