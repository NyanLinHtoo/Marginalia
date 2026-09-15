import Link from "next/link";
import type { Metadata } from "next";
import { loginAction } from "@/actions/auth";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
	searchParams,
}: {
	searchParams: Promise<{ from?: string }>;
}) {
	const { from } = await searchParams;
	// Only allow internal paths as a redirect target, so ?from= can't be used
	// to bounce someone to an external site after login.
	const redirectTo = from?.startsWith("/") ? from : "/";

	return (
		<div className="mx-auto max-w-sm px-6 py-16">
			<h1 className="font-serif text-2xl font-semibold text-foreground">
				Sign in
			</h1>
			<p className="mt-1 text-sm text-muted-foreground">
				Sign in to join the conversation.
			</p>

			<AuthForm
				action={loginAction}
				redirectTo={redirectTo}
				submitLabel="Sign in"
			/>

			<p className="mt-6 text-sm text-muted-foreground">
				No account yet? <Link href="/register">Create one</Link>.
			</p>
		</div>
	);
}
