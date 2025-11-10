# Market Radar Platform - Deployment Guide

## Prerequisites

1. Supabase account
2. Netlify account
3. API Keys:
   - Anthropic Claude API
   - OpenAI API (for embeddings)
   - Serper API or SerpApi
   - NewsAPI (optional)

## Supabase Setup

1. Create a new Supabase project
2. Run migrations:
   ```bash
   cd supabase
   supabase db reset
   ```
3. Enable pgvector extension (should be automatic)
4. Set up environment variables in Supabase Dashboard:
   - `ANTHROPIC_API_KEY`
   - `OPENAI_API_KEY`
   - `SERPER_API_KEY` (or `SERPAPI_KEY`)
   - `NEWSAPI_KEY`

## Supabase Edge Functions Deployment

Deploy each Edge Function:

```bash
supabase functions deploy ingest-news
supabase functions deploy ingest-rss
supabase functions deploy web-search
supabase functions deploy research-agent
supabase functions deploy competitive-agent
supabase functions deploy trend-agent
supabase functions deploy strategy-agent
supabase functions deploy generate-embeddings
supabase functions deploy semantic-search
supabase functions deploy extract-entities
```

## Netlify Deployment

1. Connect your GitHub repository to Netlify
2. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `apps/web/.next`
3. Set environment variables in Netlify:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (for API routes)
   - `ANTHROPIC_API_KEY`
   - `OPENAI_API_KEY`
   - `SERPER_API_KEY`
   - `NEWSAPI_KEY`

## Scheduled Jobs

Set up cron jobs or scheduled functions for:
- Daily news ingestion: `ingest-news`
- RSS feed ingestion: `ingest-rss` (every 6 hours)
- Entity extraction: `extract-entities` (daily)
- Embedding generation: `generate-embeddings` (daily)

## Monitoring

1. Set up Sentry for error tracking
2. Monitor Supabase dashboard for database performance
3. Monitor Netlify analytics for frontend performance
4. Set up alerts for API rate limits

## Security Checklist

- [ ] RLS policies are enabled on all tables
- [ ] Service role key is only used server-side
- [ ] API keys are stored securely
- [ ] Rate limiting is configured
- [ ] CORS is properly configured
- [ ] Authentication is required for sensitive endpoints

