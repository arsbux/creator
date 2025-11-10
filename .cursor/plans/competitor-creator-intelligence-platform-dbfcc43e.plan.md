<!-- dbfcc43e-d02d-482f-9749-45897ebd88a8 5006c0ad-560e-4717-b68f-94dcf115d2b7 -->
# Competitor Creator Intelligence Platform

## Overview

Rebuild the entire project to create a platform that helps companies discover which creators their competitors are sponsoring. The system analyzes a company website, identifies competitor brands from a YouTube sponsorship database, and provides detailed analytics on competitor creator selection strategies.

## Database Schema (Read-Only)

The platform will connect to the existing Supabase database with these tables:

- `brands` - Brand information (name, website, description, primary_category)
- `brand_aliases` - Alternative names for brands
- `creators` - Creator information (display_name, category, country_code, total_followers)
- `creator_accounts` - Platform-specific creator accounts (username, followers, platform)
- `videos` - Video details (title, description, category, views, published_at)
- `sponsorships` - Links brands to videos/creators (detection_confidence, mention_type, start_second)

## Implementation Plan

### Phase 1: Project Setup & Database Types

1. **Delete existing codebase** (keep only essential config files)
2. **Create new Next.js 14 app** with TypeScript and Tailwind CSS
3. **Set up database types** for the sponsorship schema:

- Create `apps/web/lib/sponsorship-database.types.ts` with TypeScript types for all tables
- Update Supabase client configuration to use read-only connection

4. **Environment setup**:

- `.env.local` with Supabase connection (read-only anon key)
- Anthropic Claude API key for AI analysis

### Phase 2: Core AI Analysis Engine

1. **Company Analysis API Route** (`/api/analyze-company`):

- Accept company website URL
- Scrape website content
- Use Claude AI to extract:
- Company name
- Industry/category (e.g., "e-commerce platform", "SaaS", "fintech")
- Business description
- Products/services
- Return structured analysis

2. **Competitor Identification Service**:

- Fetch all brands from database
- For each brand, use Claude AI to:
- Analyze brand website/description
- Determine if it's in the same industry as user's company
- Score similarity (0-100%)
- Filter and rank competitors by similarity score
- Return top competitors

### Phase 3: Creator Selection Analytics

1. **Data Aggregation Service**:

- Query `sponsorships` table filtered by competitor brand IDs
- Join with `creators`, `videos`, and `creator_accounts` tables
- Aggregate data:
- Creator list with stats (followers, category, country)
- Top creator categories
- Follower distribution (ranges)
- Geographic distribution
- Video performance metrics (views, categories)
- Sponsorship frequency over time

2. **Analytics API Route** (`/api/competitor-analytics`):

- Accept competitor brand IDs
- Return aggregated creator selection data
- Include both detailed lists and summary statistics

### Phase 4: Frontend Implementation

1. **Home Page** (`/`):

- Simple form: "Enter your company website URL"
- Loading states during analysis
- Results display

2. **Results Page** (`/results`):

- **Company Analysis Section**: Shows analyzed company info
- **Competitors Section**: List of identified competitors with similarity scores
- **Creator Selection Analytics**:
- **Detailed List View**: Table of all creators sponsored by competitors
- Creator name, category, followers, country
- Number of sponsorships, average video views
- Links to creator accounts
- **Analytics Dashboard**:
- Charts: Creator categories distribution
- Charts: Follower ranges distribution
- Charts: Geographic distribution
- Charts: Sponsorship timeline
- Summary statistics (total creators, avg followers, etc.)

3. **UI Components**:

- Modern, clean design with Tailwind CSS
- Responsive layout
- Loading skeletons
- Error handling
- Data visualization (Recharts for charts)

### Phase 5: Edge Functions (Optional)

If needed for performance, create Supabase Edge Functions:

- `analyze-company` - Company website analysis
- `identify-competitors` - Batch competitor identification
- `get-creator-analytics` - Aggregated analytics queries

## Technical Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Recharts
- **Backend**: Next.js API Routes, Supabase (read-only)
- **AI**: Anthropic Claude API
- **Database**: Supabase PostgreSQL (read-only access)

## Key Files to Create

- `apps/web/lib/sponsorship-database.types.ts` - Database type definitions
- `apps/web/lib/supabase-sponsorship.ts` - Read-only Supabase client
- `apps/web/app/api/analyze-company/route.ts` - Company analysis endpoint
- `apps/web/app/api/identify-competitors/route.ts` - Competitor identification
- `apps/web/app/api/competitor-analytics/route.ts` - Analytics aggregation
- `apps/web/app/page.tsx` - Home page with URL input
- `apps/web/app/results/page.tsx` - Results display page
- `apps/web/components/CompetitorList.tsx` - Competitor cards
- `apps/web/components/CreatorTable.tsx` - Detailed creator list
- `apps/web/components/AnalyticsDashboard.tsx` - Charts and statistics

## Read-Only Database Constraint

- All database operations will be `SELECT` queries only
- Use Supabase anon key (read-only permissions)
- No `INSERT`, `UPDATE`, or `DELETE` operations
- All data modifications happen in application memory/state only

### To-dos

- [ ] Delete existing codebase and set up new Next.js project structure with TypeScript and Tailwind
- [ ] Create TypeScript types for sponsorship database schema (brands, creators, videos, sponsorships, etc.)
- [ ] Set up read-only Supabase client configuration for sponsorship database
- [ ] Build company analysis API route that scrapes website and uses Claude AI to extract industry/category
- [ ] Create competitor identification service that analyzes brands from database and matches by industry
- [ ] Build analytics service to aggregate creator selection data from sponsorships table with joins
- [ ] Create home page with company website URL input form
- [ ] Build results page showing company analysis, competitors, and creator analytics
- [ ] Create detailed creator list component with sorting and filtering
- [ ] Build analytics dashboard with charts showing creator categories, followers, geography, and timeline