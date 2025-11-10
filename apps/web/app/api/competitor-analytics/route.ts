import { NextResponse } from 'next/server';
import { createSponsorshipServerClient } from '@/lib/supabase-sponsorship';

export async function POST(request: Request) {
  try {
    const { competitor_ids } = await request.json();

    if (!competitor_ids || !Array.isArray(competitor_ids) || competitor_ids.length === 0) {
      return NextResponse.json(
        { error: 'competitor_ids array is required' },
        { status: 400 }
      );
    }

    const supabase = createSponsorshipServerClient();

    // Fetch sponsorships for competitor brands
    const { data: sponsorships, error: sponsorshipsError } = await supabase
      .from('sponsorships')
      .select(`
        id,
        brand_id,
        creator_id,
        video_id,
        detection_confidence,
        mention_type,
        start_second,
        created_at,
        brands(id, name),
        creators(
          id,
          display_name,
          category,
          country_code,
          total_followers
        ),
        videos(
          id,
          title,
          category,
          views,
          published_at,
          creator_account_id,
          creator_accounts(
            id,
            platform,
            username,
            url,
            followers
          )
        )
      `)
      .in('brand_id', competitor_ids);

    if (sponsorshipsError) {
      throw new Error(`Failed to fetch sponsorships: ${sponsorshipsError.message}`);
    }

    if (!sponsorships || sponsorships.length === 0) {
      return NextResponse.json({
        success: true,
        analytics: {
          totalSponsorships: 0,
          totalCreators: 0,
          creators: [],
          categoryDistribution: {},
          followerDistribution: {},
          geographicDistribution: {},
          timeline: [],
          summary: {
            avgFollowers: 0,
            totalVideoViews: 0,
            avgVideoViews: 0,
          },
        },
      });
    }

    // Process and aggregate data
    const creatorMap = new Map<string, any>();
    const categoryCounts: Record<string, number> = {};
    const followerRanges: Record<string, number> = {
      '0-10k': 0,
      '10k-100k': 0,
      '100k-500k': 0,
      '500k-1M': 0,
      '1M-5M': 0,
      '5M+': 0,
    };
    const geographicCounts: Record<string, number> = {};
    const timelineData: Record<string, number> = {};
    let totalVideoViews = 0;
    let videoCount = 0;

    sponsorships.forEach((sponsorship: any) => {
      const creator = sponsorship.creators;
      const video = sponsorship.videos;
      const brand = sponsorship.brands;

      if (!creator || !video) return;

      const creatorId = creator.id;

      // Aggregate creator data
      if (!creatorMap.has(creatorId)) {
        const followers = creator.total_followers || 0;
        creatorMap.set(creatorId, {
          id: creatorId,
          displayName: creator.display_name,
          category: creator.category || 'Unknown',
          countryCode: creator.country_code || 'Unknown',
          totalFollowers: followers,
          sponsorshipCount: 0,
          brands: new Set(),
          videos: [],
          totalVideoViews: 0,
        });

        // Category distribution
        const category = creator.category || 'Unknown';
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;

        // Follower distribution
        if (followers < 10000) {
          followerRanges['0-10k']++;
        } else if (followers < 100000) {
          followerRanges['10k-100k']++;
        } else if (followers < 500000) {
          followerRanges['100k-500k']++;
        } else if (followers < 1000000) {
          followerRanges['500k-1M']++;
        } else if (followers < 5000000) {
          followerRanges['1M-5M']++;
        } else {
          followerRanges['5M+']++;
        }

        // Geographic distribution
        const country = creator.country_code || 'Unknown';
        geographicCounts[country] = (geographicCounts[country] || 0) + 1;
      }

      const creatorData = creatorMap.get(creatorId)!;
      creatorData.sponsorshipCount++;
      creatorData.brands.add(brand.name);

      if (video.views) {
        creatorData.totalVideoViews += video.views;
        totalVideoViews += video.views;
        videoCount++;
      }

      creatorData.videos.push({
        id: video.id,
        title: video.title,
        views: video.views,
        publishedAt: video.published_at,
        category: video.category,
        url: video.url,
        creatorAccount: video.creator_accounts ? {
          platform: video.creator_accounts.platform,
          username: video.creator_accounts.username,
          url: video.creator_accounts.url,
        } : null,
      });

      // Timeline data (by month)
      if (sponsorship.created_at) {
        const date = new Date(sponsorship.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        timelineData[monthKey] = (timelineData[monthKey] || 0) + 1;
      }
    });

    // Convert creator map to array and calculate averages
    const creators = Array.from(creatorMap.values()).map(creator => ({
      id: creator.id,
      displayName: creator.displayName,
      category: creator.category,
      countryCode: creator.countryCode,
      totalFollowers: creator.totalFollowers,
      sponsorshipCount: creator.sponsorshipCount,
      brands: Array.from(creator.brands),
      avgVideoViews: creator.videos.length > 0 
        ? Math.round(creator.totalVideoViews / creator.videos.length)
        : 0,
      videos: creator.videos,
    }));

    // Sort creators by sponsorship count (most sponsored first)
    creators.sort((a, b) => b.sponsorshipCount - a.sponsorshipCount);

    // Sort timeline data
    const timeline = Object.entries(timelineData)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Calculate summary statistics
    const totalFollowers = creators.reduce((sum, c) => sum + c.totalFollowers, 0);
    const avgFollowers = creators.length > 0 ? Math.round(totalFollowers / creators.length) : 0;
    const avgVideoViews = videoCount > 0 ? Math.round(totalVideoViews / videoCount) : 0;

    return NextResponse.json({
      success: true,
      analytics: {
        totalSponsorships: sponsorships.length,
        totalCreators: creators.length,
        creators,
        categoryDistribution: categoryCounts,
        followerDistribution: followerRanges,
        geographicDistribution: geographicCounts,
        timeline,
        summary: {
          avgFollowers,
          totalVideoViews,
          avgVideoViews,
          totalVideos: videoCount,
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching competitor analytics:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch competitor analytics',
      },
      { status: 500 }
    );
  }
}

