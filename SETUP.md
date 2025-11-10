# Market Radar - Setup Instructions

## Prerequisites

- Node.js 18+ and npm
- Supabase CLI (`npm install -g supabase`)
- Docker (for local Supabase development)

## Local Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Supabase Local Development

```bash
# Start Supabase locally
supabase start

# This will:
# - Start PostgreSQL with required extensions
# - Start Supabase Studio at http://localhost:54323
# - Provide connection details
```

### 3. Enable pgvector Extension

The pgvector extension is required for vector search features. 

**For Local Supabase:**
The Supabase Docker image should include pgvector. If you get an error, you may need to:

1. Check your Supabase version:
   ```bash
   supabase --version
   ```

2. Update Supabase CLI:
   ```bash
   npm install -g supabase@latest
   ```

3. Restart Supabase:
   ```bash
   supabase stop
   supabase start
   ```

**For Cloud Supabase:**
1. Go to your Supabase Dashboard
2. Navigate to Database > Extensions
3. Search for "vector" or "pgvector"
4. Click "Enable"

### 4. Run Database Migrations

```bash
# Apply all migrations
supabase db reset

# Or apply migrations incrementally
supabase migration up
```

### 5. Set Up Environment Variables

Create `.env.local` in the `apps/web` directory:

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

ANTHROPIC_API_KEY=<your-anthropic-key>
OPENAI_API_KEY=<your-openai-key>
SERPER_API_KEY=<your-serper-key>
NEWSAPI_KEY=<your-newsapi-key>
```

Get your keys from:
- Supabase: Run `supabase status` to see local URLs and keys
- Anthropic: https://console.anthropic.com/
- OpenAI: https://platform.openai.com/api-keys
- Serper: https://serper.dev/api-key
- NewsAPI: https://newsapi.org/register

### 6. Start Development Server

```bash
# From project root
npm run dev

# Or from apps/web
cd apps/web
npm run dev
```

The app will be available at http://localhost:3000

## Troubleshooting

### pgvector Extension Not Found

If you see errors about pgvector:

1. **Local Development:**
   - Ensure you're using the latest Supabase CLI
   - Try: `supabase stop && supabase start`
   - Check Docker is running

2. **Cloud Supabase:**
   - Enable the extension via Dashboard
   - The extension should be available in all Supabase projects

3. **Workaround (without pgvector):**
   - The migration will continue without pgvector
   - Vector search features will be disabled
   - All other features will work normally

### Database Connection Issues

- Verify Supabase is running: `supabase status`
- Check environment variables are set correctly
- Ensure ports 54321-54324 are not in use

### Migration Errors

- Reset database: `supabase db reset`
- Check migration files are valid SQL
- Review Supabase logs: `supabase logs`

## Next Steps

1. Set up authentication (Supabase Auth is already configured)
2. Deploy Edge Functions: `supabase functions deploy <function-name>`
3. Set up scheduled jobs for data ingestion
4. Deploy to production (see DEPLOYMENT.md)


