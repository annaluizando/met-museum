import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { QueryProvider } from "@/lib/providers/query-provider";
import { Header } from "@/components/layouts/header";
import { Footer } from "@/components/layouts/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MetMuseum Explorer | Discover Art from The Metropolitan Museum",
  description: "Explore over 470,000 artworks from The Metropolitan Museum of Art collection. Search, discover, and create your own art collections.",
  keywords: ["art", "museum", "metropolitan museum", "artwork", "collection", "paintings", "sculptures"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          src="/theme-init.js"
          strategy="beforeInteractive"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <QueryProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-zinc-900 focus:text-white focus:rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:bg-zinc-100 dark:focus:text-zinc-900"
          >
            Skip to main content
          </a>
          <Header />
          <main id="main-content" className="flex-1" tabIndex={-1}>
            {children}
          </main>
          <Footer />
        </QueryProvider>
      </body>
    </html>
  );
}
