# Quick Deploy Edge Functions

## Step 1: Login to Supabase

Run this command in your terminal (it will open a browser for authentication):

```bash
npx supabase login
```

## Step 2: Link Your Project

```bash
cd /Users/keithkatale/Projects/Radarr
npx supabase link --project-ref wftacxxjfujqmnmzlwfy
```

## Step 3: Deploy Functions

Run the deployment script:

```bash
./deploy-functions.sh
```

Or deploy individually:

```bash
npx supabase functions deploy analyze-company --no-verify-jwt
npx supabase functions deploy deep-research --no-verify-jwt
npx supabase functions deploy generate-report --no-verify-jwt
```

## Step 4: Set Environment Variables

Go to your Supabase Dashboard:
1. Navigate to **Project Settings** > **Edge Functions** > **Secrets**
2. Add these secrets:
   - `ANTHROPIC_API_KEY` = your Claude API key
   - `SERPER_API_KEY` = your Serper API key
   - `SUPABASE_URL` = https://wftacxxjfujqmnmzlwfy.supabase.co
   - `SUPABASE_SERVICE_ROLE_KEY` = your service role key

## Alternative: Deploy via Dashboard

1. Go to Supabase Dashboard > Edge Functions
2. Click "Create a new function"
3. For each function:
   - Name: `analyze-company`, `deep-research`, or `generate-report`
   - Copy the code from `supabase/functions/[function-name]/index.ts`
   - Paste and deploy

## Verify Deployment

Check that functions are deployed:

```bash
npx supabase functions list
```

You should see all three functions listed.

