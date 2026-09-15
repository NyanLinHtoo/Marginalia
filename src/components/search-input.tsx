"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import type { Route } from "next";

export function SearchInput({
	placeholder = "Search posts…",
}: {
	placeholder?: string;
}) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const [isPending, startTransition] = useTransition();
	const [value, setValue] = useState(searchParams.get("q") ?? "");

	// Debounce URL updates so we don't re-query on every keystroke. The query
	// lives in the URL rather than component state so results stay shareable
	// and are rendered on the server.
	useEffect(() => {
		const current = searchParams.get("q") ?? "";
		if (value === current) return;

		const timeout = setTimeout(() => {
			const params = new URLSearchParams(searchParams);
			if (value) {
				params.set("q", value);
			} else {
				params.delete("q");
			}
			startTransition(() => {
				router.replace(`${pathname}?${params.toString()}` as Route, {
					scroll: false,
				});
			});
		}, 300);

		return () => clearTimeout(timeout);
	}, [value, searchParams, pathname, router]);

	return (
		<div className="relative">
			<label htmlFor="search" className="sr-only">
				Search posts
			</label>
			<input
				id="search"
				type="search"
				value={value}
				onChange={(e) => setValue(e.target.value)}
				placeholder={placeholder}
				className="w-full rounded-md border border-border bg-card px-3 py-2 text-foreground outline-none focus:border-accent"
			/>
			{isPending && (
				<span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-muted-foreground">
					…
				</span>
			)}
		</div>
	);
}
