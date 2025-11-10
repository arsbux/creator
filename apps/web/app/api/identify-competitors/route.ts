import { NextResponse } from 'next/server';
import { createSponsorshipServerClient } from '@/lib/supabase-sponsorship';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY is not set');
}

// Type assertion after validation
const API_KEY: string = ANTHROPIC_API_KEY;

interface CompetitorCandidate {
  id: string;
  name: string;
  website: string | null;
  description: string | null;
  similarityScore: number;
}

export async function POST(request: Request) {
  try {
    const { industry, company_description } = await request.json();

    if (!industry) {
      return NextResponse.json(
        { error: 'industry is required' },
        { status: 400 }
      );
    }

    const supabase = createSponsorshipServerClient();

    // Fetch all brands from database
    // Severely reduced limit to prevent timeout on Netlify (10s free tier, 26s paid)
    const { data: brands, error: brandsError } = await supabase
      .from('brands')
      .select('id, name, website, description')
      .limit(50); // Reduced to 50 to ensure completion within timeout limits

    if (brandsError) {
      throw new Error(`Failed to fetch brands: ${brandsError.message}`);
    }

    if (!brands || brands.length === 0) {
      return NextResponse.json({
        success: true,
        competitors: [],
      });
    }

    // Type assertion for brands
    const brandsData = brands as Array<{
      id: string;
      name: string;
      website: string | null;
      description: string | null;
    }>;

    // Batch process brands to reduce API calls
    // Small batch size to process quickly and avoid timeouts
    const competitors: CompetitorCandidate[] = [];
    const batchSize = 10; // Small batches to process quickly and stay within timeout

    for (let i = 0; i < brandsData.length; i += batchSize) {
      const batch = brandsData.slice(i, i + batchSize);
      
      try {
        // Prepare batch prompt with all brands (truncated for speed)
        const brandsList = batch.map((brand, idx) => {
          const brandInfo = [
            `${idx + 1}. ${brand.name}`,
            brand.website ? `   Website: ${brand.website}` : '',
            brand.description 
              ? `   Description: ${brand.description.substring(0, 150)}${brand.description.length > 150 ? '...' : ''}`
              : '   Description: No description available',
          ].filter(Boolean).join('\n');
          return brandInfo;
        }).join('\n\n');

        const systemPrompt = `You are a competitive intelligence analyst. Analyze multiple brands and determine which are competitors to a company in a specific industry.

Target Industry: ${industry}
Target Company Description: ${company_description || 'Not provided'}

For each brand in the list, determine if it operates in the same industry and could be considered a competitor.

You must return a JSON array with exactly ${batch.length} items, one for each brand in order. Each item should have:
- "brand_index": the index number (0-based) matching the brand's position in the list
- "is_competitor": true/false
- "similarity_score": 0-100 (percentage of how similar/competitive they are)
- "description": a brief 1 sentence (max 100 characters) description of what this company does
- "reasoning": brief one-sentence explanation of why it is/isn't a competitor

Be strict - only mark as competitor if they are truly in the same industry and could compete for the same customers.
For the description, create a very concise one-sentence summary (under 100 characters) of the company's business.

Return ONLY a valid JSON array, no other text.`;

        const userMessage = `Analyze ${batch.length} brands:\n\n${brandsList}\n\nReturn JSON array.`;

        // Single API call for the entire batch
        const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': API_KEY,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            max_tokens: 2000, // Reduced from 4096 to speed up response
            system: systemPrompt,
            messages: [
              {
                role: 'user',
                content: userMessage,
              },
            ],
          }),
        });

        if (!claudeResponse.ok) {
          const errorText = await claudeResponse.text();
          console.error(`Failed to analyze batch ${i / batchSize + 1}:`, errorText);
          continue; // Skip this batch and continue with next
        }

        const claudeData = await claudeResponse.json();
        const responseText = Array.isArray(claudeData.content) && claudeData.content[0]?.type === 'text' 
          ? claudeData.content[0].text 
          : typeof claudeData.content === 'string' 
          ? claudeData.content 
          : JSON.stringify(claudeData.content);
        
        // Extract JSON array from response
        let jsonText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        // Try to find JSON array
        const arrayMatch = jsonText.match(/\[[\s\S]*\]/);
        if (!arrayMatch) {
          console.error(`Failed to parse batch response as JSON array for batch ${i / batchSize + 1}`);
          continue;
        }

        try {
          const analyses = JSON.parse(arrayMatch[0]);
          
          // Map analyses back to brands
          analyses.forEach((analysis: any) => {
            if (analysis.brand_index !== undefined && 
                analysis.is_competitor && 
                analysis.similarity_score >= 30) {
              const brandIndex = analysis.brand_index;
              if (brandIndex >= 0 && brandIndex < batch.length) {
                const brand = batch[brandIndex];
                competitors.push({
                  id: brand.id,
                  name: brand.name,
                  website: brand.website,
                  // Use AI-generated description if available, otherwise fall back to database description
                  description: analysis.description || brand.description || null,
                  similarityScore: analysis.similarity_score,
                });
              }
            }
          });
        } catch (parseError) {
          console.error(`Failed to parse analyses for batch ${i / batchSize + 1}:`, parseError);
        }

        // Small delay between batches to avoid rate limits, but keep it minimal for speed
        if (i + batchSize < brandsData.length) {
          await new Promise(resolve => setTimeout(resolve, 200)); // Minimal delay to stay fast
        }
      } catch (error) {
        console.error(`Error processing batch ${i / batchSize + 1}:`, error);
        // Continue with next batch even if this one fails
        continue;
      }
    }

    // Sort by similarity score (highest first)
    competitors.sort((a, b) => b.similarityScore - a.similarityScore);

    // Return top 20 competitors
    const topCompetitors = competitors.slice(0, 20);

    return NextResponse.json({
      success: true,
      competitors: topCompetitors,
      totalAnalyzed: brands.length,
      totalCompetitors: competitors.length,
    });
  } catch (error: any) {
    console.error('Error identifying competitors:', error);
    
    // Check if it's a timeout error
    if (error.message?.includes('timeout') || error.name === 'TimeoutError') {
      return NextResponse.json(
        {
          success: false,
          error: 'Request timed out. The analysis is taking longer than expected. Please try again with a smaller dataset or contact support.',
        },
        { status: 504 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to identify competitors',
      },
      { status: 500 }
    );
  }
}

