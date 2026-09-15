"use server";

import { AuthError } from "next-auth";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { signIn, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const registerSchema = z.object({
	name: z.string().trim().min(1, "Name is required."),
	email: z.string().trim().email("Enter a valid email address."),
	password: z.string().min(8, "Password must be at least 8 characters."),
});

/** Creates a reader account (role USER) and signs them straight in. */
export async function registerAction(
	_prevState: string | undefined,
	formData: FormData,
): Promise<string | undefined> {
	const parsed = registerSchema.safeParse({
		name: formData.get("name"),
		email: formData.get("email"),
		password: formData.get("password"),
	});

	if (!parsed.success) {
		return parsed.error.issues[0]?.message ?? "Invalid input.";
	}

	const { name, email, password } = parsed.data;

	const existing = await prisma.user.findUnique({ where: { email } });
	if (existing) {
		return "An account with that email already exists.";
	}

	await prisma.user.create({
		data: {
			name,
			email,
			password: await bcrypt.hash(password, 10),
			role: "USER",
		},
	});

	try {
		await signIn("credentials", { email, password, redirectTo: "/" });
	} catch (error) {
		if (error instanceof AuthError) {
			return "Account created, but sign-in failed. Try signing in.";
		}
		throw error;
	}
}

export async function loginAction(
	_prevState: string | undefined,
	formData: FormData,
): Promise<string | undefined> {
	// Readers signing in from a post page pass the post URL so they land back
	// where they were; the admin login form leaves this as the default.
	const redirectTo = (formData.get("redirectTo") as string) || "/admin";

	try {
		await signIn("credentials", {
			email: formData.get("email"),
			password: formData.get("password"),
			redirectTo,
		});
	} catch (error) {
		// signIn() throws a redirect internally on success — only treat actual
		// AuthErrors as a failed login, and let everything else propagate.
		if (error instanceof AuthError) {
			return "Incorrect email or password.";
		}
		throw error;
	}
}

export async function logoutAction(redirectTo: string = "/admin/login") {
	await signOut({ redirectTo });
}
