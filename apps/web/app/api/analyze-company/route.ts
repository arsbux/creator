import { NextResponse } from 'next/server';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY is not set');
}

// Type assertion after validation
const API_KEY: string = ANTHROPIC_API_KEY;

async function scrapeWebsite(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CompetitorCreatorIntelligence/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    // Simple text extraction (remove HTML tags)
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 8000); // Limit to 8k chars (reduced from 15k to save tokens)

    return text;
  } catch (error: any) {
    throw new Error(`Website scraping failed: ${error.message}`);
  }
}

export async function POST(request: Request) {
  try {
    const { website_url } = await request.json();

    if (!website_url) {
      return NextResponse.json(
        { error: 'website_url is required' },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(website_url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Scrape website
    const websiteContent = await scrapeWebsite(website_url);

    // Analyze with Claude
    const systemPrompt = `You are a business intelligence analyst. Analyze company websites and extract key information.

Analyze the website content and provide:
1. Company name
2. Industry/category (e.g., "e-commerce platform", "SaaS", "fintech", "gaming", "beauty", "fitness")
3. What the company does (detailed description)
4. Products/services offered
5. Target market

The industry/category is CRITICAL - it must be specific and accurate (e.g., "e-commerce platform", "project management SaaS", "fintech payment processing", "gaming hardware", "beauty subscription box").

Format your response as JSON with these keys:
{
  "company_name": "...",
  "industry": "...",
  "description": "...",
  "products_services": [...],
  "target_market": "..."
}`;

    // Call Claude API
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1500, // Reduced from 2000 to save tokens
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `Analyze this company website:\n\nURL: ${website_url}\n\nWebsite Content:\n${websiteContent}`,
          },
        ],
      }),
    });

    if (!claudeResponse.ok) {
      const errorText = await claudeResponse.text();
      throw new Error(`Claude API error: ${claudeResponse.status} ${errorText}`);
    }

    const claudeData = await claudeResponse.json();
    const responseText = Array.isArray(claudeData.content) && claudeData.content[0]?.type === 'text' 
      ? claudeData.content[0].text 
      : typeof claudeData.content === 'string' 
      ? claudeData.content 
      : JSON.stringify(claudeData.content);
    
    // Extract JSON from response
    let jsonText = responseText;
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse Claude response as JSON');
    }

    // Parse JSON
    let cleanedJson = jsonMatch[0];
    const safeJsonParse = (jsonStr: string) => {
      try {
        return JSON.parse(jsonStr);
      } catch (e: any) {
        let cleaned = jsonStr
          .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
          .replace(/\n\s*([,\}\]])/g, ' $1')
          .replace(/([,\{\[])\s*\n/g, '$1 ');
        
        try {
          return JSON.parse(cleaned);
        } catch (e2) {
          cleaned = cleaned.replace(/([^\\])\n/g, '$1\\n');
          try {
            return JSON.parse(cleaned);
          } catch (e3: any) {
            throw new Error(`Failed to parse JSON: ${e.message}`);
          }
        }
      }
    };
    
    const analysis = safeJsonParse(cleanedJson);

    return NextResponse.json({
      success: true,
      analysis: {
        company_name: analysis.company_name,
        industry: analysis.industry,
        description: analysis.description,
        products_services: analysis.products_services || [],
        target_market: analysis.target_market,
      },
    });
  } catch (error: any) {
    console.error('Error analyzing company:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to analyze company',
      },
      { status: 500 }
    );
  }
}

