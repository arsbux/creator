#!/bin/bash
# Manual deployment script - run after login

echo "🚀 Deploying Supabase Edge Functions..."
echo ""

echo "1️⃣  Deploying analyze-company..."
npx supabase@latest functions deploy analyze-company --no-verify-jwt

echo ""
echo "2️⃣  Deploying deep-research..."
npx supabase@latest functions deploy deep-research --no-verify-jwt

echo ""
echo "3️⃣  Deploying generate-report..."
npx supabase@latest functions deploy generate-report --no-verify-jwt

echo ""
echo "✅ Deployment complete!"
echo ""
echo "⚠️  Don't forget to set environment variables in Supabase Dashboard:"
echo "   - ANTHROPIC_API_KEY"
echo "   - SERPER_API_KEY"
echo "   - SUPABASE_URL"
echo "   - SUPABASE_SERVICE_ROLE_KEY"
