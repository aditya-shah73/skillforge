import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { ProgressProvider } from "@/lib/progress";
import { TokeyProvider } from "@/components/Tokey";
import HeaderStats from "@/components/HeaderStats";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI for Engineers",
  description: "A hands-on AI course for working full-stack engineers. Build real intuition for LLMs, embeddings, RAG, and agents — then ship production-quality AI features.",
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
            <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
              <nav className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                <Link href="/" className="font-bold text-lg tracking-tight">
                  <span className="text-indigo-600 dark:text-indigo-400">AI</span> for Engineers
                </Link>
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
