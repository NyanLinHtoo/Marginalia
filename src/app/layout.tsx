import type { Metadata } from "next";
import { Source_Serif_4, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { siteName, siteDescription, siteUrl } from "@/lib/site";
import "./globals.css";

const sourceSerif = Source_Serif_4({
	subsets: ["latin"],
	variable: "--font-serif",
	display: "swap",
});

const plexSans = IBM_Plex_Sans({
	subsets: ["latin"],
	weight: ["400", "500", "600"],
	variable: "--font-sans",
	display: "swap",
});

const plexMono = IBM_Plex_Mono({
	subsets: ["latin"],
	weight: ["400", "500"],
	variable: "--font-mono",
	display: "swap",
});

export const metadata: Metadata = {
	metadataBase: new URL(siteUrl),
	title: {
		default: siteName,
		template: `%s · ${siteName}`,
	},
	icons: {
		icon: "/marginalia.svg",
	},
	description: siteDescription,
	openGraph: {
		type: "website",
		siteName,
		title: siteName,
		description: siteDescription,
		url: siteUrl,
	},
	twitter: {
		card: "summary_large_image",
		title: siteName,
		description: siteDescription,
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html
			lang="en"
			suppressHydrationWarning
			className={`${sourceSerif.variable} ${plexSans.variable} ${plexMono.variable}`}>
			<body className="min-h-screen bg-background text-foreground font-sans antialiased">
				{children}
			</body>
		</html>
	);
}
