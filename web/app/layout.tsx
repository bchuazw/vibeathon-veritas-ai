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
  description: "AI-powered news analysis powered by our 3-Agent Pipeline (Scout → Writer → Editor) and Virlo-optimized headlines. Veritas AI delivers credible, viral-ready journalism with transparency you can trust.",
  keywords: ["AI", "news", "journalism", "fact-checking", "credibility", "Virlo", "viral content", "multi-agent"],
  authors: [{ name: "Veritas AI" }],
  creator: "Veritas AI",
  publisher: "Veritas AI",
  metadataBase: new URL("https://veritas-ai-frontend.onrender.com"),
  openGraph: {
    title: "Veritas AI - Truth in the Age of Information",
    description: "AI-powered news analysis with 3-Agent Pipeline (Scout → Writer → Editor) and Virlo-optimized headlines.",
    url: "https://veritas-ai-frontend.onrender.com",
    siteName: "Veritas AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Veritas AI - AI-Powered Journalism",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Veritas AI - Truth in the Age of Information",
    description: "AI-powered news analysis with 3-Agent Pipeline and Virlo-optimized headlines.",
    images: ["/og-image.svg"],
    creator: "@veritasai",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} scroll-smooth`}>
      <body className="font-sans antialiased bg-background text-foreground">
        {/* Skip to main content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-stone-900 focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-900"
        >
          Skip to main content
        </a>
        <Header />
        <main id="main-content">{children}</main>
      </body>
    </html>
  );
}
