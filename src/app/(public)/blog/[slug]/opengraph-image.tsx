import { ImageResponse } from "next/og";
import { getPostBySlug } from "@/lib/posts";
import { siteName } from "@/lib/site";

export const alt = "Post cover";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Generates the social preview image at request time (cached), so shared
 * links show the post title rather than a generic fallback.
 * Note: system fonts only here — next/og doesn't use the app's CSS.
 */
export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#f7f6f1",
          color: "#1b1b16",
          padding: "80px",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, color: "#6b6a61" }}>
          {siteName}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 68,
            fontWeight: 600,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
          }}
        >
          {post?.title ?? "Post not found"}
        </div>

        <div style={{ display: "flex", fontSize: 26, color: "#2b6e63" }}>
          {post?.excerpt?.slice(0, 100) ?? ""}
        </div>
      </div>
    ),
    size
  );
}
