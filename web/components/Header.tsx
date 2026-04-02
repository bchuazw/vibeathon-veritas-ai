import Link from "next/link";
import { Newspaper } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-200 bg-stone-50/95 backdrop-blur supports-[backdrop-filter]:bg-stone-50/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Newspaper className="h-6 w-6 text-stone-800" />
          <span className="font-serif text-xl font-bold tracking-tight text-stone-900">
            Veritas AI
          </span>
        </Link>
        <nav className="flex items-center space-x-6 text-sm font-medium">
          <Link 
            href="/" 
            className="text-stone-600 transition-colors hover:text-stone-900"
          >
            Home
          </Link>
          <Link 
            href="/#latest" 
            className="text-stone-600 transition-colors hover:text-stone-900"
          >
            Latest
          </Link>
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-stone-600 transition-colors hover:text-stone-900"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}
