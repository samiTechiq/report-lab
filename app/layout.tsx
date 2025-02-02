"use client";

import { Toaster } from "@/components/ui/toaster";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "@/components/providers";

const fontSans = FontSans({
	subsets: ["latin"],
	variable: "--font-sans",
});

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<link rel="manifest" href="/manifest.json" />
				<meta name="theme-color" content="#000000" />
				<meta
					name="description"
					content="A modern report management application"
				/>
				<meta name="mobile-web-app-capable" content="yes" />
				<meta
					name="apple-mobile-web-app-status-bar-style"
					content="white"
				/>
				<meta name="apple-mobile-web-app-title" content="Report Lab" />
				<link
					rel="apple-touch-icon"
					sizes="180x180"
					href="/favicon/apple-touch-icon.png"
				/>
				<link
					rel="icon"
					type="image/png"
					sizes="32x32"
					href="/favicon/favicon-32x32.png"
				/>
				<link
					rel="icon"
					type="image/png"
					sizes="16x16"
					href="/favicon/favicon-16x16.png"
				/>
				<link rel="manifest" href="/favicon/site.webmanifest" />
				<link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
				<script
					dangerouslySetInnerHTML={{
						__html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('ServiceWorker registration successful');
                    },
                    function(err) {
                      console.log('ServiceWorker registration failed: ', err);
                    }
                  );
                });
              }
            `,
					}}
				/>
			</head>
			<body className={fontSans.variable} suppressHydrationWarning>
				<Providers>
					<Toaster />
					{children}
				</Providers>
			</body>
		</html>
	);
}

export function ClientComponent({ children }: { children: React.ReactNode }) {
	return (
		<div
			className={cn(
				"min-h-screen bg-background font-sans antialiased",
				fontSans.variable
			)}
		>
			{children}
		</div>
	);
}
