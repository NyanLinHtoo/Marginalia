import { prisma } from "@/lib/prisma";

type PostFilters = {
	/** Free-text search across title, excerpt, and body. */
	query?: string;
	/** Tag slug to filter by. */
	tag?: string;
};

export async function getPublishedPosts(filters: PostFilters = {}) {
	const { query, tag } = filters;

	return prisma.post.findMany({
		where: {
			published: true,
			...(tag ? { tags: { some: { slug: tag } } } : {}),
			...(query
				? {
						OR: [
							{ title: { contains: query, mode: "insensitive" } },
							{ excerpt: { contains: query, mode: "insensitive" } },
							{ content: { contains: query, mode: "insensitive" } },
						],
					}
				: {}),
		},
		orderBy: { publishedAt: "desc" },
		include: { tags: true, author: { select: { name: true } } },
	});
}

/** Tags that have at least one published post, with counts, for the tag nav. */
export async function getTagsWithCounts() {
	const tags = await prisma.tag.findMany({
		where: { posts: { some: { published: true } } },
		include: {
			_count: { select: { posts: { where: { published: true } } } },
		},
		orderBy: { name: "asc" },
	});

	return tags.map((tag) => ({
		id: tag.id,
		name: tag.name,
		slug: tag.slug,
		count: tag._count.posts,
	}));
}

export async function getTagBySlug(slug: string) {
	return prisma.tag.findUnique({ where: { slug } });
}

export async function getAllTagSlugs() {
	const tags = await prisma.tag.findMany({
		where: { posts: { some: { published: true } } },
		select: { slug: true },
	});
	return tags.map((t) => t.slug);
}

export async function getPostBySlug(slug: string) {
	return prisma.post.findFirst({
		where: { slug, published: true },
		include: {
			tags: true,
			author: { select: { name: true } },
		},
	});
}

export async function getAllPublishedSlugs() {
	const posts = await prisma.post.findMany({
		where: { published: true },
		select: { slug: true },
	});
	return posts.map((p) => p.slug);
}

/** Rough reading time from word count, ~200 wpm. */
export function readingTime(content: string) {
	const words = content.trim().split(/\s+/).length;
	const minutes = Math.max(1, Math.round(words / 200));
	return `${minutes} min read`;
}
