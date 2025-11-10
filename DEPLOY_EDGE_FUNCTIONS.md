# Deploy Supabase Edge Functions

The Market Radar app requires Supabase Edge Functions to be deployed. Follow these steps:

## Prerequisites

1. Supabase CLI installed: `npm install -g supabase`
2. Logged in to Supabase: `supabase login`
3. Linked to your project: `supabase link --project-ref your-project-ref`

## Deploy Functions

From the project root, deploy each function:

```bash
# Deploy analyze-company function
supabase functions deploy analyze-company

# Deploy deep-research function
supabase functions deploy deep-research

# Deploy generate-report function
supabase functions deploy generate-report
```

## Set Environment Variables

Set these secrets in your Supabase project:

```bash
supabase secrets set ANTHROPIC_API_KEY=your_key
supabase secrets set SERPER_API_KEY=your_key
supabase secrets set SUPABASE_URL=your_supabase_url
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Or set them via Supabase Dashboard:
1. Go to Project Settings > Edge Functions
2. Add secrets for each environment variable

## Verify Deployment

Check that functions are deployed:
```bash
supabase functions list
```

## Local Development

For local development, start Supabase locally:
```bash
supabase start
```

Then the functions will be available at:
- `http://localhost:54321/functions/v1/analyze-company`
- `http://localhost:54321/functions/v1/deep-research`
- `http://localhost:54321/functions/v1/generate-report`

Make sure your `.env.local` has:
```
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
```

