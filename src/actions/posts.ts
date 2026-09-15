"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const postSchema = z.object({
	title: z.string().min(1, "Title is required"),
	slug: z
		.string()
		.min(1, "Slug is required")
		.regex(
			/^[a-z0-9-]+$/,
			"Slug can only contain lowercase letters, numbers, and hyphens",
		),
	excerpt: z.string().optional(),
	content: z.string().min(1, "Content is required"),
	coverImage: z.string().optional(),
	tags: z.string().optional(), // comma-separated
	published: z.boolean(),
});

/** Every action re-checks the session itself — the proxy guard covers page
 * loads, but Server Actions can in principle be invoked directly. */
async function requireAdmin() {
	const session = await auth();
	const role = (session?.user as { role?: string } | undefined)?.role;
	if (role !== "ADMIN") {
		throw new Error("Not authorized.");
	}
	return session!.user as { id: string };
}

function parseTags(raw: string | undefined) {
	if (!raw) return [];
	return raw
		.split(",")
		.map((t) => t.trim())
		.filter(Boolean)
		.map((name) => ({ name, slug: name.toLowerCase().replace(/\s+/g, "-") }));
}

export async function createPost(
	_prevState: string | undefined,
	formData: FormData,
) {
	const admin = await requireAdmin();

	const parsed = postSchema.safeParse({
		title: formData.get("title"),
		slug: formData.get("slug"),
		excerpt: formData.get("excerpt") || undefined,
		content: formData.get("content"),
		coverImage: formData.get("coverImage") || undefined,
		tags: formData.get("tags") || undefined,
		published: formData.get("published") === "on",
	});

	if (!parsed.success) {
		return parsed.error.issues[0]?.message ?? "Invalid input.";
	}

	const { tags, published, ...data } = parsed.data;
	const tagConnections = parseTags(tags);

	try {
		await prisma.post.create({
			data: {
				...data,
				published,
				publishedAt: published ? new Date() : null,
				authorId: admin.id,
				tags: {
					connectOrCreate: tagConnections.map((tag) => ({
						where: { slug: tag.slug },
						create: tag,
					})),
				},
			},
		});
	} catch {
		return "A post with that slug already exists.";
	}

	revalidatePath("/");
	revalidatePath("/admin");
	redirect("/admin");
}

export async function updatePost(
	postId: string,
	_prevState: string | undefined,
	formData: FormData,
) {
	await requireAdmin();

	const parsed = postSchema.safeParse({
		title: formData.get("title"),
		slug: formData.get("slug"),
		excerpt: formData.get("excerpt") || undefined,
		content: formData.get("content"),
		coverImage: formData.get("coverImage") || undefined,
		tags: formData.get("tags") || undefined,
		published: formData.get("published") === "on",
	});

	if (!parsed.success) {
		return parsed.error.issues[0]?.message ?? "Invalid input.";
	}

	const { tags, published, ...data } = parsed.data;
	const tagConnections = parseTags(tags);
	const existing = await prisma.post.findUnique({ where: { id: postId } });

	try {
		await prisma.post.update({
			where: { id: postId },
			data: {
				...data,
				published,
				publishedAt:
					published && !existing?.published
						? new Date()
						: existing?.publishedAt,
				tags: {
					set: [],
					connectOrCreate: tagConnections.map((tag) => ({
						where: { slug: tag.slug },
						create: tag,
					})),
				},
			},
		});
	} catch {
		return "A post with that slug already exists.";
	}

	revalidatePath("/");
	revalidatePath(`/blog/${parsed.data.slug}`);
	revalidatePath("/admin");
	redirect("/admin");
}

export async function deletePost(postId: string) {
	await requireAdmin();
	const post = await prisma.post.delete({ where: { id: postId } });
	revalidatePath("/");
	revalidatePath(`/blog/${post.slug}`);
	revalidatePath("/admin");
}

export async function togglePublish(postId: string) {
	await requireAdmin();
	const post = await prisma.post.findUniqueOrThrow({ where: { id: postId } });
	await prisma.post.update({
		where: { id: postId },
		data: {
			published: !post.published,
			publishedAt: !post.published ? new Date() : post.publishedAt,
		},
	});
	revalidatePath("/");
	revalidatePath(`/blog/${post.slug}`);
	revalidatePath("/admin");
}
