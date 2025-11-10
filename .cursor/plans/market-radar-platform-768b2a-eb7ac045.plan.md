<!-- eb7ac045-3e2d-4e73-a60e-3bd83c3c793c 1964df7a-bf53-4c61-893d-6a539e564a9d -->
# Company Deep Research Platform - Implementation Plan

## Product Vision

A focused AI-powered company research tool that:

1. Takes a company website URL as input
2. Uses Claude AI to analyze the company and generate a detailed description
3. Performs deep web research based on that analysis
4. Generates comprehensive market intelligence reports covering:

   - Company analysis & positioning
   - Market radar & industry landscape
   - Hidden insights & opportunities
   - Competitive intelligence
   - Strategic recommendations

## Core User Flow

1. **Input**: User enters company website URL (e.g., `https://example.com`)
2. **Analysis**: System scrapes/analyzes the website and uses Claude to understand:

   - What the company does
   - Products/services
   - Target market
   - Business model
   - Technology stack (if visible)

3. **Research**: Based on the analysis, perform multi-step web searches for:

   - Company news & press releases
   - Industry reports & market data
   - Competitor analysis
   - Funding & financial information
   - Product launches & updates
   - Market opportunities

4. **Report Generation**: Claude synthesizes all findings into a comprehensive report

## Architecture Changes

### Simplified Stack

- **Frontend**: Next.js 14 (App Router) - Single page application
- **Backend**: Supabase Edge Functions for API endpoints
- **AI**: Anthropic Claude API (primary)
- **Web Search**: Serper API (free tier: 2,500 calls)
- **Database**: Supabase PostgreSQL (simplified schema)

### New Database Schema

**Core Tables:**

- `company_researches` - Main research records
  - id, website_url, company_name, description (AI-generated), status, created_at, updated_at
- `research_sources` - Web search results and sources
  - id, research_id, source_url, title, snippet, content_type, relevance_score
- `research_reports` - Generated intelligence reports
  - id, research_id, report_type, content (JSON), generated_at

### Key Components

**1. Company Analyzer (Claude + Web Scraping)**

- Scrape company website
- Extract key information
- Use Claude to generate detailed company description
- Identify key search terms and research angles

**2. Deep Research Engine**

- Multi-step web searches using Serper API
- Search strategies:
  - Company name + "market analysis"
  - Company name + "industry trends"
  - Company name + "competitors"
  - Company name + "funding" OR "investment"
  - Company name + "opportunities"
  - Product names + "market size"
- Aggregate and deduplicate results

**3. Intelligence Synthesis (Claude)**

- Process all research sources
- Generate structured report with:
  - Executive Summary
  - Company Deep Dive
  - Market Position & Industry Analysis
  - Competitive Landscape
  - Hidden Insights & Opportunities
  - Strategic Recommendations
  - Risk Assessment

**4. Report Presentation**

- Clean, readable report UI
- Export to PDF
- Shareable links

## Implementation Plan

### Phase 1: Core Research Flow (Days 1-3)

1. Create simplified database schema
2. Build company website scraper/analyzer
3. Implement Claude company analysis
4. Create web search integration (Serper API)
5. Build research orchestration logic

### Phase 2: Report Generation (Days 4-5)

1. Implement Claude report synthesis
2. Create report template structure
3. Build report UI component
4. Add PDF export functionality

### Phase 3: UI/UX (Days 6-7)

1. Create single-page research interface
2. Add URL input form
3. Build research progress indicator
4. Design report display page
5. Add loading states and error handling

### Phase 4: Polish & Enhancements (Days 8-10)

1. Add research history
2. Implement caching for repeated URLs
3. Add export/share features
4. Performance optimization
5. Error handling & edge cases

## Technical Implementation Details

### Supabase Edge Functions

**`analyze-company`**

- Input: website_url
- Scrapes website (using fetch + basic parsing)
- Calls Claude to analyze company
- Returns: company description, key terms, research angles

**`deep-research`**

- Input: company_name, description, research_angles
- Performs multiple Serper API searches
- Aggregates results
- Stores in research_sources table
- Returns: aggregated research data

**`generate-report`**

- Input: research_id
- Fetches all research sources
- Calls Claude with structured prompt
- Generates comprehensive report
- Stores in research_reports table
- Returns: final report

### Frontend Pages

**`/` - Main Research Page**

- URL input form
- Research history (if any)
- Recent reports

**`/research/[id]` - Research Report View**

- Full report display
- Export options
- Source links

### Claude Prompts

**Company Analysis Prompt:**

```
Analyze this company website and provide:
1. What the company does (detailed description)
2. Products/services offered
3. Target market and customers
4. Business model
5. Key differentiators
6. Technology stack (if visible)
7. Suggested research angles for market intelligence
```

**Report Generation Prompt:**

```
Based on the following company information and research sources, generate a comprehensive market intelligence report:

Company: [name and description]
Research Sources: [all aggregated web search results]

Generate a report with:
1. Executive Summary
2. Company Deep Dive
3. Market Position & Industry Analysis
4. Competitive Landscape
5. Hidden Insights & Opportunities
6. Strategic Recommendations
7. Risk Assessment

Be specific, cite sources, and provide actionable insights.
```

## Success Metrics

- Research completion time: < 2 minutes
- Report quality: Comprehensive, actionable, well-sourced
- User satisfaction: Clear, valuable insights
- Accuracy: Factual, up-to-date information

## Future Enhancements

- Multi-company comparison
- Industry trend analysis
- Automated monitoring/updates
- Custom research templates
- API access for integrations

### To-dos

- [ ] Create simplified database schema with company_researches, research_sources, and research_reports tables
- [ ] Build company website scraper and Claude-based company analyzer that generates detailed description and research angles
- [ ] Implement multi-step web research using Serper API with intelligent search strategies based on company analysis
- [ ] Build Claude-powered report generation that synthesizes all research into comprehensive market intelligence report
- [ ] Create single-page research interface with URL input, progress tracking, and report display
- [ ] Implement Supabase Edge Functions: analyze-company, deep-research, and generate-report
- [ ] Add PDF export functionality for research reports
- [ ] Implement research history and caching for repeated company URLs