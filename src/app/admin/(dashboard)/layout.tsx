import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { logoutAction } from "@/actions/auth";

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await auth();
	const role = (session?.user as { role?: string } | undefined)?.role;

	// The proxy already redirects unauthenticated/non-admin requests before
	// they reach this layout — this check is a second line of defense in case
	// this layout is ever reached another way.
	if (role !== "ADMIN") {
		redirect("/admin/login");
	}

	return (
		<div className="min-h-screen bg-background">
			<header className="border-b border-border">
				<div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
					<nav className="flex items-center gap-6 text-sm">
						<Link
							href="/admin"
							className="font-medium text-foreground no-underline">
							Dashboard
						</Link>
						<Link
							href="/admin/posts/new"
							className="text-muted-foreground no-underline hover:text-accent">
							New post
						</Link>
						<Link
							href="/admin/comments"
							className="text-muted-foreground no-underline hover:text-accent">
							Comments
						</Link>
						<Link
							href="/"
							className="text-muted-foreground no-underline hover:text-accent">
							View site
						</Link>
					</nav>
					<form action={logoutAction.bind(null, "/admin/login")}>
						<button
							type="submit"
							className="text-sm text-muted-foreground hover:text-accent">
							Sign out
						</button>
					</form>
				</div>
			</header>
			<main className="mx-auto max-w-4xl px-6 py-10">{children}</main>
		</div>
	);
}
