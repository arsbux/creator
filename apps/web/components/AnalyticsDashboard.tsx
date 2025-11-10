'use client';

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

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

interface AnalyticsDashboardProps {
  analytics: Analytics;
}

const COLORS = ['#1a1a1a', '#4a4a4a', '#6a6a6a', '#8a8a8a', '#aaaaaa', '#cacaca', '#eaeaea'];

export default function AnalyticsDashboard({ analytics }: AnalyticsDashboardProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  // Prepare data for charts
  const categoryData = Object.entries(analytics.categoryDistribution)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const followerData = Object.entries(analytics.followerDistribution)
    .map(([name, value]) => ({ name, value }))
    .filter((item) => item.value > 0);

  const geographicData = Object.entries(analytics.geographicDistribution)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10); // Top 10 countries

  return (
    <div className="space-y-8 sm:space-y-12">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
        <div>
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Creators</div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900">{analytics.totalCreators}</div>
        </div>
        <div>
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Sponsorships</div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900">{analytics.totalSponsorships}</div>
        </div>
        <div>
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Avg Followers</div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900">
            {formatNumber(analytics.summary.avgFollowers)}
          </div>
        </div>
        <div>
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Avg Views</div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900">
            {formatNumber(analytics.summary.avgVideoViews)}
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Category Distribution */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Creator Categories
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="value" fill="#1a1a1a" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Follower Distribution */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Follower Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={followerData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#1a1a1a"
                dataKey="value"
              >
                {followerData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Geographic Distribution */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Geographic Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={geographicData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" fontSize={12} />
              <YAxis dataKey="name" type="category" width={60} fontSize={12} />
              <Tooltip />
              <Bar dataKey="value" fill="#4a4a4a" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Timeline */}
        {analytics.timeline.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Sponsorship Timeline
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={analytics.timeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" angle={-45} textAnchor="end" height={80} fontSize={12} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#1a1a1a" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

