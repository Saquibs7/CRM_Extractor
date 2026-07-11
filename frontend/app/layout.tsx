import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "CRM Extractor - AI-Powered CSV Importer",
  description: "Intelligently extract CRM lead information from any CSV format using AI",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased dark:bg-[#121417] dark:text-slate-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
