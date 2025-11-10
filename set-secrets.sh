#!/bin/bash

# Set Supabase Edge Function secrets
# Make sure you're logged in: npx supabase login

echo "Setting Supabase Edge Function secrets..."
echo ""

# Read from .env.local if it exists
if [ -f "apps/web/.env.local" ]; then
  source apps/web/.env.local
fi

# Set secrets
echo "Setting ANTHROPIC_API_KEY..."
npx supabase secrets set ANTHROPIC_API_KEY="${ANTHROPIC_API_KEY}"

echo "Setting SERPER_API_KEY..."
npx supabase secrets set SERPER_API_KEY="${SERPER_API_KEY}"

echo "Setting SUPABASE_URL..."
npx supabase secrets set SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL}"

echo "Setting SUPABASE_SERVICE_ROLE_KEY..."
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY="${SUPABASE_SERVICE_ROLE_KEY}"

echo ""
echo "✅ Secrets set! You can verify in Supabase Dashboard > Project Settings > Edge Functions > Secrets"

