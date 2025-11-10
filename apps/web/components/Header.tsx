'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <header className="w-full border-b border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-900 rounded-full flex items-center justify-center">
              <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-white rounded-full"></div>
            </div>
            <span className="text-base sm:text-lg font-semibold text-gray-900">CreatorIntel</span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/"
              className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 px-2 sm:px-3 py-2 rounded-md transition-colors"
            >
              Home
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

