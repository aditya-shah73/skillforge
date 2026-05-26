import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { ProgressProvider } from "@/lib/progress";
import { TokeyProvider } from "@/components/Tokey";
import HeaderStats from "@/components/HeaderStats";
import ReadingProgress from "@/components/ReadingProgress";
import CommandPalette from "@/components/CommandPalette";
import KeyboardHelp from "@/components/KeyboardHelp";
import SearchButton from "@/components/SearchButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Skillforge — hands-on courses for engineers",
  description: "Project-driven, pattern-first courses for working engineers. Currently shipping: AI Engineering Foundations. In planning: Data Structures and Algorithms.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <ProgressProvider>
          <TokeyProvider>
            <ReadingProgress />
            <CommandPalette />
            <KeyboardHelp />
            <header className="sticky top-0 z-10 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              {/* Header layout: tighter gutters + gap on mobile (px-4 / gap-3)
                  so the brand + search + stats row fits a 360px viewport
                  without horizontal scroll. Brand shrinks to text-2xl on
                  mobile (was text-3xl) to free another ~16px for stats. */}
              <nav className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-4 sm:gap-4 sm:px-6">
                <Link href="/" className="shrink-0 text-2xl leading-none font-bold tracking-tight sm:text-4xl">
                  <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">Skillforge</span>
                </Link>
                {/* Search bar fills remaining space; stats stay compact on the right.
                    `min-w-0` on the search wrapper lets the button shrink below its
                    intrinsic content width so the row can never overflow. */}
                <div className="flex min-w-0 flex-1 justify-end sm:justify-start">
                  <SearchButton />
                </div>
                <HeaderStats />
              </nav>
            </header>
            {/* Tighter horizontal padding on mobile (px-4) buys ~16px of
                content width on phones — critical for code blocks and tables
                that don't have their own overflow handling. */}
            <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
              {children}
            </main>
          </TokeyProvider>
        </ProgressProvider>
      </body>
    </html>
  );
}
