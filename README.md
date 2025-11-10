# Competitor Creator Intelligence Platform

AI-powered platform that helps companies discover which creators their competitors are sponsoring on YouTube and other platforms.

## Features

- **Company Analysis**: Enter a company website URL, and AI analyzes what the company does and identifies its industry
- **Competitor Identification**: System finds competitor brands in your industry from the sponsorship database
- **Creator Analytics**: Detailed analytics on which creators your competitors are sponsoring, including:
  - Creator categories distribution
  - Follower ranges
  - Geographic distribution
  - Sponsorship timeline
  - Detailed creator list with sorting and filtering

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS + Recharts
- **Backend**: Next.js API Routes
- **Database**: Supabase PostgreSQL (read-only access)
- **AI**: Anthropic Claude API

## Getting Started

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables** in `apps/web/.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
ANTHROPIC_API_KEY=your_claude_api_key
```

3. **Start development server:**
```bash
npm run dev
```

The app will be available at http://localhost:3000

## Usage

1. Enter a company website URL on the home page
2. The system will:
   - Analyze the company website using Claude AI
   - Identify competitor brands in the same industry
   - Fetch creator sponsorship data for those competitors
3. View detailed analytics and creator lists

## Database Schema

This platform connects to a read-only Supabase database with the following tables:
- `brands` - Brand information
- `brand_aliases` - Alternative names for brands
- `creators` - Creator information
- `creator_accounts` - Platform-specific creator accounts
- `videos` - Video details
- `sponsorships` - Links brands to videos/creators

**Important**: This platform is read-only and does not modify the database in any way.

## Project Structure

```
apps/web/
├── app/
│   ├── api/
│   │   ├── analyze-company/      # Company analysis endpoint
│   │   ├── identify-competitors/  # Competitor identification
│   │   └── competitor-analytics/  # Analytics aggregation
│   ├── results/                   # Results display page
│   └── page.tsx                   # Home page
├── components/
│   ├── CompetitorList.tsx         # Competitor cards
│   ├── CreatorTable.tsx           # Detailed creator list
│   └── AnalyticsDashboard.tsx     # Charts and statistics
└── lib/
    ├── sponsorship-database.types.ts  # Database type definitions
    └── supabase-sponsorship.ts        # Read-only Supabase client
```

## License

Private - Internal Tool
