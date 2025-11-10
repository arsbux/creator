'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Brand {
  id: string;
  name: string;
  website: string | null;
  description: string | null;
  primaryCategory: string | null;
}

interface Creator {
  id: string;
  displayName: string;
  category: string;
  countryCode: string;
  totalFollowers: number;
  sponsorshipCount: number;
  videos: Array<{
    id: string;
    title: string | null;
    views: number | null;
    publishedAt: string | null;
    category: string | null;
    url: string | null;
    mentionType: string | null;
    startSecond: number | null;
    createdAt: string;
    account: {
      platform: string;
      username: string;
      url: string | null;
      followers: number | null;
    } | null;
  }>;
  accounts: Array<{
    platform: string;
    username: string;
    url: string | null;
    followers: number | null;
  }>;
}

interface Summary {
  totalSponsorships: number;
  totalCreators: number;
  totalVideoViews: number;
  avgFollowers: number;
}

export default function CompetitorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const competitorId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    if (!competitorId) return;

    const fetchData = async () => {
      try {
        const response = await fetch(`/api/competitor/${competitorId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch competitor data');
        }

        const data = await response.json();
        setBrand(data.brand);
        setCreators(data.creators);
        setSummary(data.summary);
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [competitorId]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-t-gray-900 mb-4"></div>
          <p className="text-gray-500">Loading competitor profile...</p>
        </div>
      </div>
    );
  }

  if (error || !brand) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-500 mb-6">{error || 'Competitor not found'}</p>
          <Link
            href="/"
            className="inline-block bg-gray-900 text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <Link
            href="/results"
            className="text-sm text-gray-400 hover:text-gray-900 mb-4 sm:mb-6 inline-flex items-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Logo placeholder */}
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-xl sm:text-2xl font-bold text-gray-400">
                {brand.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight mb-2 sm:mb-3 break-words">{brand.name}</h1>
              {brand.website && (
                <div className="mb-3">
                  <a
                    href={brand.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-500 hover:text-gray-900 transition-colors inline-flex items-center gap-1.5"
                  >
                    {brand.website}
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              )}
              {brand.description && (
                <p className="text-gray-600 leading-relaxed max-w-2xl text-sm">{brand.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-12">
            <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Creators</div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">{summary.totalCreators}</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Sponsorships</div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">{summary.totalSponsorships}</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Avg Followers</div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                {formatNumber(summary.avgFollowers)}
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Video Views</div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                {formatNumber(summary.totalVideoViews)}
              </div>
            </div>
          </div>
        )}

        {/* Creators Section */}
        <div>
          <div className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
              Sponsored Creators
            </h2>
            <p className="text-sm text-gray-400">{creators.length} creators</p>
          </div>

          {creators.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-gray-500">No creators found for this brand</p>
            </div>
          ) : (
            <div className="space-y-6">
              {creators.map((creator) => (
                <div
                  key={creator.id}
                  className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 hover:border-gray-300 transition-colors"
                >
                  {/* Creator Header */}
                  <div className="mb-4 sm:mb-5">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 break-words">
                      {creator.displayName}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {creator.category && (
                        <span className="text-xs font-medium text-gray-600 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200">
                          {creator.category}
                        </span>
                      )}
                      {creator.countryCode && (
                        <span className="text-xs font-medium text-gray-600 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200">
                          {creator.countryCode}
                        </span>
                      )}
                      <span className="text-xs font-medium text-gray-600 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200">
                        {formatNumber(creator.totalFollowers)} followers
                      </span>
                      <span className="text-xs font-medium text-gray-600 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200">
                        {creator.sponsorshipCount} sponsorship{creator.sponsorshipCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Creator Accounts */}
                  {creator.accounts.length > 0 && (
                    <div className="mb-5 pb-5 border-b border-gray-100">
                      <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Platform Accounts</div>
                      <div className="flex flex-wrap gap-3">
                        {creator.accounts.map((account, idx) => (
                          <a
                            key={idx}
                            href={account.url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 transition-colors bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200 hover:border-gray-300"
                          >
                            <span className="font-medium">{account.platform}</span>
                            <span className="text-gray-500">@{account.username}</span>
                            {account.followers && (
                              <span className="text-gray-400 text-xs">
                                ({formatNumber(account.followers)})
                              </span>
                            )}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sponsored Videos */}
                  {creator.videos.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">
                        Videos ({creator.videos.length})
                      </div>
                      <div className="space-y-3">
                        {creator.videos.slice(0, 5).map((video) => (
                          <div
                            key={video.id}
                            className="group bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-300 hover:bg-white transition-all"
                          >
                            {video.url ? (
                              <a
                                href={video.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-900 hover:text-gray-600 font-medium text-sm transition-colors inline-flex items-center gap-2 group-hover:text-gray-900"
                              >
                                {video.title || 'Untitled Video'}
                                <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                            ) : (
                              <span className="text-gray-900 font-medium text-sm">
                                {video.title || 'Untitled Video'}
                              </span>
                            )}
                            <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-500">
                              {video.views && (
                                <span>{formatNumber(video.views)} views</span>
                              )}
                              {video.publishedAt && (
                                <span>• {formatDate(video.publishedAt)}</span>
                              )}
                              {video.category && (
                                <span>• {video.category}</span>
                              )}
                            </div>
                          </div>
                        ))}
                        {creator.videos.length > 5 && (
                          <p className="text-xs text-gray-400 mt-3 text-center">
                            +{creator.videos.length - 5} more videos
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

