"use client";

import { useActionState } from "react";
import { loginAction } from "@/actions/auth";

export default function LoginPage() {
	const [error, formAction, pending] = useActionState(loginAction, undefined);

	return (
		<div className="flex min-h-screen items-center justify-center bg-background px-6">
			<div className="w-full max-w-sm">
				<h1 className="font-serif text-2xl font-semibold text-foreground">
					Sign in
				</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Admin access to Marginalia.
				</p>

				<form action={formAction} className="mt-8 space-y-4">
					<div>
						<label
							htmlFor="email"
							className="block text-sm font-medium text-foreground">
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
						<label
							htmlFor="password"
							className="block text-sm font-medium text-foreground">
							Password
						</label>
						<input
							id="password"
							name="password"
							type="password"
							required
							autoComplete="current-password"
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
						className="w-full rounded-md bg-foreground px-4 py-2 text-background disabled:opacity-60">
						{pending ? "Signing in…" : "Sign in"}
					</button>
				</form>
			</div>
		</div>
	);
}
