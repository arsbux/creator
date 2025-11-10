'use client';

import { useState } from 'react';

interface Creator {
  id: string;
  displayName: string;
  category: string;
  countryCode: string;
  totalFollowers: number;
  sponsorshipCount: number;
  brands: string[];
  avgVideoViews: number;
  videos: Array<{
    id: string;
    title: string | null;
    views: number | null;
    publishedAt: string | null;
    category: string | null;
    url: string | null;
    creatorAccount: {
      platform: string;
      username: string;
      url: string | null;
    } | null;
  }>;
}

interface CreatorTableProps {
  creators: Creator[];
}

export default function CreatorTable({ creators }: CreatorTableProps) {
  const [sortBy, setSortBy] = useState<'followers' | 'sponsorships' | 'views'>('sponsorships');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const sortedCreators = [...creators].sort((a, b) => {
    let aValue: number;
    let bValue: number;

    switch (sortBy) {
      case 'followers':
        aValue = a.totalFollowers;
        bValue = b.totalFollowers;
        break;
      case 'sponsorships':
        aValue = a.sponsorshipCount;
        bValue = b.sponsorshipCount;
        break;
      case 'views':
        aValue = a.avgVideoViews;
        bValue = b.avgVideoViews;
        break;
      default:
        return 0;
    }

    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
  });

  const handleSort = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  return (
    <div className="overflow-hidden">
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
            Creators
          </h3>
          <div className="text-sm text-gray-400">{creators.length} total</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleSort('sponsorships')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              sortBy === 'sponsorships'
                ? 'bg-gray-900 text-white'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Sponsorships
          </button>
          <button
            onClick={() => handleSort('followers')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              sortBy === 'followers'
                ? 'bg-gray-900 text-white'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Followers
          </button>
          <button
            onClick={() => handleSort('views')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              sortBy === 'views'
                ? 'bg-gray-900 text-white'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Views
          </button>
        </div>
      </div>

      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-50">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    Creator
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    Category
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    Followers
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    Sponsorships
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    Avg Views
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    Brands
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    Country
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {sortedCreators.map((creator) => (
                  <tr key={creator.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {creator.displayName}
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{creator.category}</span>
                    </td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {formatNumber(creator.totalFollowers)}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{creator.sponsorshipCount}</span>
                    </td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {formatNumber(creator.avgVideoViews)}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4">
                      <div className="text-sm text-gray-600">
                        {creator.brands.slice(0, 2).join(', ')}
                        {creator.brands.length > 2 && (
                          <span className="text-gray-400"> +{creator.brands.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{creator.countryCode}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

