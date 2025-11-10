'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import CompetitorList from '@/components/CompetitorList';
import CreatorTable from '@/components/CreatorTable';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';

interface CompanyAnalysis {
  company_name: string;
  industry: string;
  description: string;
  products_services: string[];
  target_market: string;
}

interface Competitor {
  id: string;
  name: string;
  website: string | null;
  description: string | null;
  similarityScore: number;
}

interface Analytics {
  totalSponsorships: number;
  totalCreators: number;
  creators: any[];
  categoryDistribution: Record<string, number>;
  followerDistribution: Record<string, number>;
  geographicDistribution: Record<string, number>;
  timeline: Array<{ month: string; count: number }>;
  summary: {
    avgFollowers: number;
    totalVideoViews: number;
    avgVideoViews: number;
    totalVideos: number;
  };
}

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const url = searchParams.get('url');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'analyzing' | 'identifying' | 'loading-analytics' | 'complete'>('analyzing');
  const [companyAnalysis, setCompanyAnalysis] = useState<CompanyAnalysis | null>(null);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [showCompanyAnalysis, setShowCompanyAnalysis] = useState(false);

  useEffect(() => {
    if (!url) {
      setError('No URL provided');
      setLoading(false);
      return;
    }

    const analyze = async () => {
      try {
        // Step 1: Analyze company
        setStep('analyzing');
        const analysisResponse = await fetch('/api/analyze-company', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ website_url: url }),
        });

        if (!analysisResponse.ok) {
          const errorData = await analysisResponse.json();
          throw new Error(errorData.error || 'Failed to analyze company');
        }

        const analysisData = await analysisResponse.json();
        setCompanyAnalysis(analysisData.analysis);
        setShowCompanyAnalysis(true); // Show company analysis while identifying competitors

        // Step 2: Identify competitors
        setStep('identifying');
        const competitorsResponse = await fetch('/api/identify-competitors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            industry: analysisData.analysis.industry,
            company_description: analysisData.analysis.description,
          }),
        });

        if (!competitorsResponse.ok) {
          let errorMessage = 'Failed to identify competitors';
          try {
            const errorData = await competitorsResponse.json();
            errorMessage = errorData.error || errorMessage;
          } catch (e) {
            // If response is not JSON (e.g., timeout), use status text
            if (competitorsResponse.status === 504) {
              errorMessage = 'Request timed out. The competitor analysis is taking longer than expected. Please try again or contact support.';
            } else {
              errorMessage = `Server error: ${competitorsResponse.status} ${competitorsResponse.statusText}`;
            }
          }
          throw new Error(errorMessage);
        }

        let competitorsData;
        try {
          competitorsData = await competitorsResponse.json();
        } catch (e) {
          throw new Error('Invalid response from server. The request may have timed out.');
        }
        setCompetitors(competitorsData.competitors);

        if (competitorsData.competitors.length === 0) {
          setLoading(false);
          return;
        }

        // Step 3: Get analytics
        setStep('loading-analytics');
        const competitorIds = competitorsData.competitors.map((c: Competitor) => c.id);
        const analyticsResponse = await fetch('/api/competitor-analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ competitor_ids: competitorIds }),
        });

        if (!analyticsResponse.ok) {
          const errorData = await analyticsResponse.json();
          throw new Error(errorData.error || 'Failed to fetch analytics');
        }

        const analyticsData = await analyticsResponse.json();
        setAnalytics(analyticsData.analytics);
        setStep('complete');
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    analyze();
  }, [url]);

  // Show loading only during initial company analysis
  if (loading && step === 'analyzing') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-t-gray-900 mb-4"></div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Analyzing your company...
          </h2>
          <p className="text-gray-500">
            This may take a few moments
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <a
            href="/"
            className="inline-block bg-gray-900 text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-colors"
          >
            Try Again
          </a>
        </div>
      </div>
    );
  }

  if (!companyAnalysis && !showCompanyAnalysis) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Header */}
        <div className="mb-8 sm:mb-12 lg:mb-16">
          <a
            href="/"
            className="text-sm text-gray-400 hover:text-gray-900 mb-4 sm:mb-6 lg:mb-8 inline-flex items-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </a>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">Analysis Results</h1>
        </div>

        {/* Company Analysis Section - Show immediately after analysis */}
        {showCompanyAnalysis && companyAnalysis && (
          <div className="mb-8 sm:mb-12 lg:mb-16">
            <div className="mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">Your Company</h2>
              <div className="h-px w-16 bg-gray-200"></div>
            </div>
            <div className="space-y-4 sm:space-y-6">
              <div>
                <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Company Name</div>
                <div className="text-xl text-gray-900">{companyAnalysis.company_name}</div>
              </div>
              <div>
                <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Industry</div>
                <div className="text-lg text-gray-700">{companyAnalysis.industry}</div>
              </div>
              <div>
                <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Description</div>
                <p className="text-gray-600 leading-relaxed">{companyAnalysis.description}</p>
              </div>
              {companyAnalysis.products_services.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Products & Services</div>
                  <div className="flex flex-wrap gap-2">
                    {companyAnalysis.products_services.map((item, idx) => (
                      <span key={idx} className="inline-block text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Competitors Section */}
        {loading && step === 'identifying' ? (
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-3">
              <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-gray-200 border-t-gray-900"></div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Identifying Competitors
              </h2>
            </div>
            <p className="text-gray-500 text-sm">
              Analyzing brands in your industry to find competitors
            </p>
          </div>
        ) : loading && step === 'loading-analytics' ? (
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-3">
              <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-gray-200 border-t-gray-900"></div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Loading Analytics
              </h2>
            </div>
            <p className="text-gray-500 text-sm">
              Gathering creator sponsorship data
            </p>
          </div>
        ) : competitors.length > 0 ? (
          <>
            <div className="mb-8 sm:mb-12 lg:mb-16">
              <div className="mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
                  Identified Competitors
                </h2>
                <div className="flex items-center gap-2">
                  <div className="h-px w-16 bg-gray-200"></div>
                  <span className="text-sm text-gray-400">{competitors.length} found</span>
                </div>
              </div>
              <CompetitorList competitors={competitors} />
            </div>

            {/* Analytics Section */}
            {analytics && (
              <>
                <div className="mb-8 sm:mb-12 lg:mb-16">
                  <div className="mb-4 sm:mb-6">
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">Creator Analytics</h2>
                    <div className="h-px w-16 bg-gray-200"></div>
                  </div>
                  <AnalyticsDashboard analytics={analytics} />
                </div>

                <div className="mb-8 sm:mb-12 lg:mb-16">
                  <div className="mb-4 sm:mb-6">
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">Creator List</h2>
                    <div className="h-px w-16 bg-gray-200"></div>
                  </div>
                  <CreatorTable creators={analytics.creators} />
                </div>
              </>
            )}
          </>
        ) : (
          <div className="mb-8 sm:mb-12 lg:mb-16">
            <div className="text-center py-16">
              <p className="text-gray-500 mb-2">No competitors found</p>
              <p className="text-sm text-gray-400">
                Your industry may not be well represented in the database
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

