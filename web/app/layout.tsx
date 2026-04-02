import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
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
    <html lang="en" className={`${inter.variable} ${playfair.variable} scroll-smooth`}>
      <body className="font-sans antialiased bg-background text-foreground">
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
