import Link from 'next/link';

interface Competitor {
  id: string;
  name: string;
  website: string | null;
  description: string | null;
  similarityScore: number;
}

interface CompetitorListProps {
  competitors: Competitor[];
}

export default function CompetitorList({ competitors }: CompetitorListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {competitors.map((competitor) => (
        <Link
          key={competitor.id}
          href={`/competitors/${competitor.id}`}
          className="group block"
        >
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 hover:border-gray-900 hover:shadow-sm transition-all">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gray-600 transition-colors">
                {competitor.name}
              </h3>
              <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2.5 py-1 rounded">
                {competitor.similarityScore}%
              </span>
            </div>
            
            {/* Company Description */}
            {competitor.description ? (
              <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                {competitor.description}
              </p>
            ) : (
              <p className="text-sm text-gray-400 italic mb-4">
                No description available
              </p>
            )}
            
            {competitor.website && (
              <div
                className="text-xs text-gray-400 hover:text-gray-600 mb-4 truncate transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <a
                  href={competitor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1"
                >
                  {competitor.website}
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            )}
            
            <div className="text-xs text-gray-400 font-medium group-hover:text-gray-600 transition-colors">
              View profile →
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

