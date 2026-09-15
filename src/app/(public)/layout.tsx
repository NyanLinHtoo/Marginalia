import Link from "next/link";
import { auth } from "@/lib/auth";
import { logoutAction } from "@/actions/auth";
import { siteName } from "@/lib/site";

export default async function PublicLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await auth();
	const user = session?.user as
		| { name?: string | null; role?: string }
		| undefined;

	return (
		<div className="flex min-h-screen flex-col">
			<header className="border-b border-border">
				<div className="mx-auto flex max-w-2xl items-baseline justify-between px-6 py-6">
					<Link
						href="/"
						className="font-serif text-lg font-semibold text-foreground no-underline">
						{siteName}
					</Link>

					<nav className="flex items-baseline gap-5 text-sm text-muted-foreground">
						<Link
							href="/"
							className="text-muted-foreground no-underline hover:text-accent">
							Posts
						</Link>

						{user ? (
							<>
								{user.role === "ADMIN" && (
									<Link
										href="/admin"
										className="text-muted-foreground no-underline hover:text-accent">
										Admin
									</Link>
								)}
								<form action={logoutAction.bind(null, "/")}>
									<button
										type="submit"
										className="text-muted-foreground hover:text-accent">
										Sign out
									</button>
								</form>
							</>
						) : (
							<Link
								href="/login"
								className="text-muted-foreground no-underline hover:text-accent">
								Sign in
							</Link>
						)}
					</nav>
				</div>
			</header>

			<main className="flex-1">{children}</main>

			<footer className="border-t border-border">
				<div className="mx-auto max-w-2xl px-6 py-8 text-sm text-muted-foreground">
					{siteName} — built with Next.js.
				</div>
			</footer>
		</div>
	);
}
