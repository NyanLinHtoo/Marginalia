"use client";

import { useActionState, useRef, useEffect } from "react";
import { addComment } from "@/actions/comments";

export function CommentForm({ postId }: { postId: string }) {
  const action = addComment.bind(null, postId);
  const [error, formAction, pending] = useActionState(action, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the textarea after a successful submit (no error came back).
  useEffect(() => {
    if (!pending && !error) formRef.current?.reset();
  }, [pending, error]);

  return (
    <form ref={formRef} action={formAction} className="mt-6">
      <label htmlFor="content" className="sr-only">
        Add a comment
      </label>
      <textarea
        id="content"
        name="content"
        rows={4}
        required
        maxLength={2000}
        placeholder="Add a comment…"
        className="w-full rounded-md border border-border bg-card px-3 py-2 text-foreground outline-none focus:border-accent"
      />

      {error && (
        <p className="mt-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-3 rounded-md bg-foreground px-4 py-2 text-sm text-background disabled:opacity-60"
      >
        {pending ? "Posting…" : "Post comment"}
      </button>
    </form>
  );
}
