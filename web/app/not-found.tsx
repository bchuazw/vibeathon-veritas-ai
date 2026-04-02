"use client";

import { useEffect } from "react";

export default function NotFound() {
  useEffect(() => {
    // Handle client-side redirect for article pages
    // This works around the _redirects file not being processed by Render
    const path = window.location.pathname;
    const match = path.match(/^\/article\/([^\/]+)\/?$/);
    if (match) {
      const articleId = match[1];
      if (articleId !== "_fallback") {
        // Redirect to the fallback page with the article ID
        window.location.replace(`/article/_fallback/?id=${articleId}`);
      }
    }
  }, []);

  return (
    <div className="container py-24">
      <div className="mx-auto max-w-3xl text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-stone-100 mx-auto mb-6">
          <svg
            className="h-10 w-10 text-stone-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="font-serif text-3xl font-bold text-stone-900 mb-4">
          Page Not Found
        </h1>
        <p className="text-stone-600 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been
          removed.
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-full hover:bg-stone-800 transition-colors"
        >
          Back to Home
        </a>
      </div>
    </div>
  );
}