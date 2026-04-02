import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Veritas AI - Truth in the Age of Information",
  description: "AI-powered news analysis that separates fact from fiction. Veritas AI delivers credible, well-sourced journalism with transparency you can trust.",
  keywords: ["AI", "news", "journalism", "fact-checking", "credibility"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} font-sans antialiased bg-stone-50 text-stone-900`}>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
