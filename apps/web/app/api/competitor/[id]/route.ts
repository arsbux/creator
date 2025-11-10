import { NextResponse } from 'next/server';
import { createSponsorshipServerClient } from '@/lib/supabase-sponsorship';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const competitorId = params.id;

    if (!competitorId) {
      return NextResponse.json(
        { error: 'Competitor ID is required' },
        { status: 400 }
      );
    }

    const supabase = createSponsorshipServerClient();

    // Fetch brand details
    const { data: brand, error: brandError } = await supabase
      .from('brands')
      .select('*')
      .eq('id', competitorId)
      .single();

    if (brandError || !brand) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      );
    }

    // Type assertion for brand after null check
    const brandData = brand as {
      id: string;
      name: string;
      website: string | null;
      description: string | null;
      primary_category: string | null;
    };

    // Fetch all sponsorships for this brand
    const { data: sponsorships, error: sponsorshipsError } = await supabase
      .from('sponsorships')
      .select(`
        id,
        creator_id,
        video_id,
        detection_confidence,
        mention_type,
        start_second,
        created_at,
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
          url,
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
      .eq('brand_id', competitorId)
      .order('created_at', { ascending: false });

    if (sponsorshipsError) {
      throw new Error(`Failed to fetch sponsorships: ${sponsorshipsError.message}`);
    }

    // Process creators data
    const creatorMap = new Map<string, any>();

    sponsorships?.forEach((sponsorship: any) => {
      const creator = sponsorship.creators;
      const video = sponsorship.videos;

      if (!creator) return;

      const creatorId = creator.id;

      if (!creatorMap.has(creatorId)) {
        creatorMap.set(creatorId, {
          id: creatorId,
          displayName: creator.display_name,
          category: creator.category || 'Unknown',
          countryCode: creator.country_code || 'Unknown',
          totalFollowers: creator.total_followers || 0,
          sponsorshipCount: 0,
          videos: [],
          accounts: new Set(),
        });
      }

      const creatorData = creatorMap.get(creatorId)!;
      creatorData.sponsorshipCount++;

      if (video) {
        creatorData.videos.push({
          id: video.id,
          title: video.title,
          views: video.views,
          publishedAt: video.published_at,
          category: video.category,
          url: video.url,
          mentionType: sponsorship.mention_type,
          startSecond: sponsorship.start_second,
          createdAt: sponsorship.created_at,
          account: video.creator_accounts ? {
            platform: video.creator_accounts.platform,
            username: video.creator_accounts.username,
            url: video.creator_accounts.url,
            followers: video.creator_accounts.followers,
          } : null,
        });

        if (video.creator_accounts) {
          creatorData.accounts.add(JSON.stringify({
            platform: video.creator_accounts.platform,
            username: video.creator_accounts.username,
            url: video.creator_accounts.url,
            followers: video.creator_accounts.followers,
          }));
        }
      }
    });

    // Convert creator map to array
    const creators = Array.from(creatorMap.values()).map(creator => ({
      ...creator,
      accounts: Array.from(creator.accounts).map(acc => JSON.parse(acc as string)),
    }));

    // Sort creators by sponsorship count
    creators.sort((a, b) => b.sponsorshipCount - a.sponsorshipCount);

    // Calculate summary statistics
    const totalSponsorships = sponsorships?.length || 0;
    const totalCreators = creators.length;
    const totalVideoViews = creators.reduce((sum, c) => 
      sum + c.videos.reduce((vSum: number, v: any) => vSum + (v.views || 0), 0), 0
    );
    const avgFollowers = creators.length > 0
      ? Math.round(creators.reduce((sum, c) => sum + c.totalFollowers, 0) / creators.length)
      : 0;

    return NextResponse.json({
      success: true,
      brand: {
        id: brandData.id,
        name: brandData.name,
        website: brandData.website,
        description: brandData.description,
        primaryCategory: brandData.primary_category,
      },
      creators,
      summary: {
        totalSponsorships,
        totalCreators,
        totalVideoViews,
        avgFollowers,
      },
    });
  } catch (error: any) {
    console.error('Error fetching competitor profile:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch competitor profile',
      },
      { status: 500 }
    );
  }
}

