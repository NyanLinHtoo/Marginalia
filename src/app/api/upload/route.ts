import { NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { auth } from "@/lib/auth";

const MAX_BYTES = 4 * 1024 * 1024; // 4 MB
const ALLOWED = {
	"image/jpeg": ".jpg",
	"image/png": ".png",
	"image/webp": ".webp",
	"image/avif": ".avif",
} as const;

/**
 * Local-disk uploads — fine for development and self-hosted deployments with
 * a persistent filesystem. On ephemeral/serverless hosts (Vercel, most
 * containers) files written here vanish on redeploy, so swap the writeFile
 * call for a blob store (Vercel Blob, S3, UploadThing, Cloudinary) and return
 * that provider's URL instead. Nothing else in the app needs to change.
 */
export async function POST(request: Request) {
	const session = await auth();
	if ((session?.user as { role?: string } | undefined)?.role !== "ADMIN") {
		return NextResponse.json({ error: "Not authorized." }, { status: 401 });
	}

	const formData = await request.formData();
	const file = formData.get("file");

	if (!(file instanceof File)) {
		return NextResponse.json({ error: "No file provided." }, { status: 400 });
	}

	const extension = ALLOWED[file.type as keyof typeof ALLOWED];
	if (!extension) {
		return NextResponse.json(
			{ error: "Unsupported file type. Use JPEG, PNG, WebP, or AVIF." },
			{ status: 400 },
		);
	}

	if (file.size > MAX_BYTES) {
		return NextResponse.json(
			{ error: "File is too large (4 MB max)." },
			{ status: 400 },
		);
	}

	// Generate the filename ourselves rather than trusting the client's, which
	// could contain path traversal segments or an unexpected extension.
	const filename = `${randomUUID()}${extension}`;
	const uploadDir = path.join(process.cwd(), "public", "uploads");

	// The folder won't exist on a fresh checkout (git doesn't track empty
	// directories), so create it rather than failing with ENOENT.
	await mkdir(uploadDir, { recursive: true });

	const bytes = Buffer.from(await file.arrayBuffer());
	await writeFile(path.join(uploadDir, filename), bytes);

	return NextResponse.json({ url: `/uploads/${filename}` });
}
