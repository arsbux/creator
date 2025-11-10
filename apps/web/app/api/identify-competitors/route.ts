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
    // Minimal limit to ensure fast completion within timeout limits
    const { data: brands, error: brandsError } = await supabase
      .from('brands')
      .select('id, name, website, description')
      .limit(20); // Minimal set to complete quickly

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
    // Very small batch size for fastest processing
    const competitors: CompetitorCandidate[] = [];
    const batchSize = 5; // Very small batches for fastest processing

    for (let i = 0; i < brandsData.length; i += batchSize) {
      const batch = brandsData.slice(i, i + batchSize);
      
      try {
        // Prepare minimal batch prompt for speed
        const brandsList = batch.map((brand, idx) => {
          return `${idx + 1}. ${brand.name}${brand.website ? ` (${brand.website})` : ''}`;
        }).join('\n');

        const systemPrompt = `Find competitors. Industry: ${industry}. Return JSON: [{"brand_index": 0, "is_competitor": true/false, "similarity_score": 0-100, "description": "max 60 chars"}]. JSON only.`;

        const userMessage = `Brands:\n${brandsList}\n\nReturn JSON array.`;

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
            max_tokens: 1000, // Minimal tokens for fastest response
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

        // No delay - process as fast as possible
      } catch (error) {
        console.error(`Error processing batch ${i / batchSize + 1}:`, error);
        // Continue with next batch even if this one fails
        continue;
      }
    }

    // Sort by similarity score (highest first)
    competitors.sort((a, b) => b.similarityScore - a.similarityScore);

    // Return top 15 competitors
    const topCompetitors = competitors.slice(0, 15);

    return NextResponse.json({
      success: true,
      competitors: topCompetitors,
      totalAnalyzed: brands.length,
      totalCompetitors: competitors.length,
    });
  } catch (error: any) {
    console.error('Error identifying competitors:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to identify competitors',
      },
      { status: 500 }
    );
  }
}

