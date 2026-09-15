"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Swap for your error reporting service (Sentry, etc.) in production.
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col justify-center px-6">
      <h1 className="font-serif text-3xl font-semibold text-foreground">
        Something went wrong
      </h1>
      <p className="mt-3 text-muted-foreground">
        An unexpected error occurred while loading this page.
      </p>
      <div className="mt-6">
        <button
          onClick={reset}
          className="rounded-md bg-foreground px-4 py-2 text-sm text-background"
        >
          Try again
        </button>
      </div>
      {error.digest && (
        <p className="mt-4 font-mono text-xs text-muted-foreground">
          Reference: {error.digest}
        </p>
      )}
    </div>
  );
}
