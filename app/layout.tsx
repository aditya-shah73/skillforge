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
  description: "Project-driven, pattern-first courses for working engineers. Currently shipping: AI for Engineers. In planning: DSA in Java.",
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
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <ProgressProvider>
          <TokeyProvider>
            <ReadingProgress />
            <CommandPalette />
            <KeyboardHelp />
            <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
              <nav className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
                <Link href="/" className="font-bold text-3xl sm:text-4xl tracking-tight leading-none shrink-0">
                  <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">Skillforge</span>
                </Link>
                {/* Search bar fills remaining space; stats stay compact on the right.
                    `min-w-0` on the search wrapper lets the button shrink below its
                    intrinsic content width so the row can never overflow. */}
                <div className="flex-1 min-w-0 flex justify-end sm:justify-start">
                  <SearchButton />
                </div>
                <HeaderStats />
              </nav>
            </header>
            <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10">
              {children}
            </main>
          </TokeyProvider>
        </ProgressProvider>
      </body>
    </html>
  );
}
