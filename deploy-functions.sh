#!/bin/bash

# Deploy Supabase Edge Functions
# Make sure you're logged in: npx supabase login

echo "Deploying Supabase Edge Functions..."

# Deploy analyze-company
echo "Deploying analyze-company..."
npx supabase@latest functions deploy analyze-company --no-verify-jwt

# Deploy deep-research
echo "Deploying deep-research..."
npx supabase@latest functions deploy deep-research --no-verify-jwt

# Deploy generate-report
echo "Deploying generate-report..."
npx supabase@latest functions deploy generate-report --no-verify-jwt

echo "✅ All functions deployed!"

