import Link from "next/link";
import type { Metadata } from "next";
import { registerAction } from "@/actions/auth";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Create an account" };

export default function RegisterPage() {
	return (
		<div className="mx-auto max-w-sm px-6 py-16">
			<h1 className="font-serif text-2xl font-semibold text-foreground">
				Create an account
			</h1>
			<p className="mt-1 text-sm text-muted-foreground">
				You only need an account to leave comments.
			</p>

			<AuthForm action={registerAction} withName submitLabel="Create account" />

			<p className="mt-6 text-sm text-muted-foreground">
				Already have one? <Link href="/login">Sign in</Link>.
			</p>
		</div>
	);
}
