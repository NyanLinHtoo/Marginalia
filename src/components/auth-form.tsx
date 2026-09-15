"use client";

import { useActionState } from "react";

type AuthFormProps = {
  action: (prevState: string | undefined, formData: FormData) => Promise<string | undefined>;
  /** Show a name field (registration only). */
  withName?: boolean;
  /** Hidden redirect target passed through to the action. */
  redirectTo?: string;
  submitLabel: string;
};

export function AuthForm({ action, withName, redirectTo, submitLabel }: AuthFormProps) {
  const [error, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="mt-8 space-y-4">
      {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}

      {withName && (
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground">
            Name
          </label>
          <input
            id="name"
            name="name"
            required
            autoComplete="name"
            className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-foreground outline-none focus:border-accent"
          />
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-foreground">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-foreground outline-none focus:border-accent"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-foreground">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete={withName ? "new-password" : "current-password"}
          className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-foreground outline-none focus:border-accent"
        />
      </div>

      {error && (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-foreground px-4 py-2 text-background disabled:opacity-60"
      >
        {pending ? "Working…" : submitLabel}
      </button>
    </form>
  );
}
