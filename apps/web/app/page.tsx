'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please enter a company website URL');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // Validate URL format
      new URL(url);
      
      // Redirect to results page with URL as query param
      router.push(`/results?url=${encodeURIComponent(url)}`);
    } catch (err) {
      setError('Please enter a valid URL (e.g., https://example.com)');
      setLoading(false);
    }
  };

  const handleSuggestion = (suggestionUrl: string) => {
    setUrl(suggestionUrl);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-2xl mx-auto text-center">
          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            What&apos;s your company?
          </h1>
          
          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-gray-500 mb-8 sm:mb-12 max-w-xl mx-auto px-4">
            Analyze your competitors and discover which creators they&apos;re sponsoring.
          </p>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="mb-8">
            <div className="relative flex items-center">
            <input
                type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter your company website"
                className="w-full px-4 sm:px-6 py-3 sm:py-4 pr-14 sm:pr-16 text-base sm:text-lg bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              disabled={loading}
            />
          <button
            type="submit"
            disabled={loading || !url.trim()}
                className="absolute right-1.5 sm:right-2 w-10 h-10 sm:w-12 sm:h-12 bg-gray-900 text-white rounded-full flex items-center justify-center hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                aria-label="Submit"
          >
            {loading ? (
                <svg
                    className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
            )}
          </button>
            </div>

            {error && (
              <div className="mt-4 text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg inline-block">
                {error}
              </div>
            )}
        </form>

          {/* Suggestion Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 px-4">
            <button
              onClick={() => handleSuggestion('https://shopify.com')}
              className="flex items-center gap-2 px-4 py-2.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              E-commerce Example
            </button>
            <button
              onClick={() => handleSuggestion('https://stripe.com')}
              className="flex items-center gap-2 px-4 py-2.5 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              SaaS Example
            </button>
            <button
              onClick={() => handleSuggestion('https://nike.com')}
              className="flex items-center gap-2 px-4 py-2.5 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              Brand Example
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
