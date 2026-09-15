// Next.js 16 renamed `middleware.ts` -> `proxy.ts` (and the exported function
// `middleware` -> `proxy`) to make the request-interception boundary explicit.
// It now runs on the Node.js runtime by default, not Edge.
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
	const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
	const isLoginPage = req.nextUrl.pathname === "/admin/login";
	const session = req.auth;

	if (isAdminRoute && !isLoginPage) {
		if (!session?.user) {
			const loginUrl = new URL("/admin/login", req.nextUrl.origin);
			return NextResponse.redirect(loginUrl);
		}
		const role = (session.user as { role?: string }).role;
		if (role !== "ADMIN") {
			return NextResponse.redirect(new URL("/", req.nextUrl.origin));
		}
	}

	return NextResponse.next();
});

export const config = {
	matcher: ["/admin/:path*"],
};
