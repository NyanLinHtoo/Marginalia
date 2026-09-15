"use client";

import { useActionState } from "react";
import { ImageUpload } from "@/components/image-upload";

type PostFormProps = {
  action: (prevState: string | undefined, formData: FormData) => Promise<string | undefined>;
  defaultValues?: {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    tags: string;
    coverImage: string;
    published: boolean;
  };
  submitLabel: string;
};

export function PostForm({ action, defaultValues, submitLabel }: PostFormProps) {
  const [error, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="mt-8 max-w-2xl space-y-5">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-foreground">
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={defaultValues?.title}
          className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-foreground outline-none focus:border-accent"
        />
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-foreground">
          Slug
        </label>
        <input
          id="slug"
          name="slug"
          required
          defaultValue={defaultValues?.slug}
          placeholder="my-post-title"
          className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 font-mono text-sm text-foreground outline-none focus:border-accent"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Used in the URL: /blog/your-slug. Lowercase letters, numbers, and hyphens only.
        </p>
      </div>

      <div>
        <label htmlFor="excerpt" className="block text-sm font-medium text-foreground">
          Excerpt
        </label>
        <textarea
          id="excerpt"
          name="excerpt"
          rows={2}
          defaultValue={defaultValues?.excerpt}
          className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-foreground outline-none focus:border-accent"
        />
      </div>

      <ImageUpload name="coverImage" defaultValue={defaultValues?.coverImage} />

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-foreground">
          Content (Markdown)
        </label>
        <textarea
          id="content"
          name="content"
          required
          rows={16}
          defaultValue={defaultValues?.content}
          className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 font-mono text-sm text-foreground outline-none focus:border-accent"
        />
      </div>

      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-foreground">
          Tags
        </label>
        <input
          id="tags"
          name="tags"
          defaultValue={defaultValues?.tags}
          placeholder="nextjs, react"
          className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-foreground outline-none focus:border-accent"
        />
        <p className="mt-1 text-xs text-muted-foreground">Comma-separated.</p>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="published"
          name="published"
          type="checkbox"
          defaultChecked={defaultValues?.published}
          className="h-4 w-4"
        />
        <label htmlFor="published" className="text-sm text-foreground">
          Published
        </label>
      </div>

      {error && (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-foreground px-4 py-2 text-sm text-background disabled:opacity-60"
      >
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
