# Vercel Deployment Guide

This guide will help you deploy the Competitor Creator Intelligence platform to Vercel.

## Prerequisites

- A Vercel account (sign up at https://vercel.com)
- An Anthropic API key (get from https://console.anthropic.com/)
- Supabase credentials for the sponsorship database

## Environment Variables

Set the following environment variables in your Vercel project settings:

### Required Environment Variables

1. **ANTHROPIC_API_KEY**
   - Your Anthropic Claude API key
   - Get it from: https://console.anthropic.com/
   - Used for AI-powered company analysis and competitor identification

2. **NEXT_PUBLIC_SUPABASE_URL**
   - Your Supabase project URL
   - Format: `https://xxxxx.supabase.co`
   - Used for read-only access to the sponsorship database

3. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Your Supabase anonymous/public key
   - Found in your Supabase project settings under API
   - Used for read-only access to the sponsorship database

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard

1. **Import Project**
   - Go to https://vercel.com/new
   - Import your Git repository (GitHub, GitLab, or Bitbucket)
   - Vercel will auto-detect Next.js

2. **Configure Project**
   - **Root Directory**: Leave as default (repository root) - the `vercel.json` handles the monorepo structure
   - **Framework Preset**: Next.js (auto-detected from `vercel.json`)
   - The `vercel.json` file at the root automatically configures:
     - Build Command: `npm install && npm run build`
     - Output Directory: `apps/web/.next`
     - Install Command: `npm install`
   - **Note**: You don't need to manually set these - Vercel will read them from `vercel.json`

3. **Add Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all three required environment variables listed above
   - Make sure to add them for Production, Preview, and Development environments

4. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete
   - Your app will be live!

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Navigate to Project Root**
   ```bash
   cd /path/to/Radarr
   ```

4. **Link Project (First Time)**
   ```bash
   vercel link
   ```
   - Follow prompts to link to existing project or create new one

5. **Set Environment Variables**
   ```bash
   vercel env add ANTHROPIC_API_KEY
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```
   - For each variable, select the environments (Production, Preview, Development)

6. **Deploy to Preview**
   ```bash
   vercel
   ```

7. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Project Structure

The project is a monorepo with the Next.js app located in `apps/web/`. 

**Important**: The `vercel.json` file is located at the **root** of the repository (not in `apps/web/`). This allows Vercel to:
- Install dependencies from the root `package.json`
- Run the build command which navigates to `apps/web` and builds the Next.js app
- Output the build to `apps/web/.next`

If you need to set a root directory in Vercel dashboard, you can set it to the repository root (default), and the `vercel.json` will handle the rest.

## Build Configuration

The `vercel.json` file includes:
- Build command that installs dependencies and builds the Next.js app
- Output directory pointing to `apps/web/.next`
- Framework detection for Next.js

## Troubleshooting

### Build Fails

- Ensure all environment variables are set
- Verify the `vercel.json` file is at the repository root
- Check that the root directory in Vercel settings is set to the repository root (default)
- Verify Node.js version (Vercel auto-detects, but you can specify in `package.json` or `vercel.json`)
- Check build logs for specific error messages

### API Routes Not Working

- Verify environment variables are set correctly
- Check Vercel function logs for errors
- Ensure API routes are in `apps/web/app/api/` directory

### Database Connection Issues

- Verify Supabase URL and anon key are correct
- Check that the database allows read-only access from your Vercel domain
- Review Supabase logs for connection errors

## Post-Deployment

After deployment:
1. Test the home page loads correctly
2. Test company analysis with a sample URL
3. Verify competitor identification works
4. Check that analytics and creator data display properly

## Custom Domain

To add a custom domain:
1. Go to Project Settings → Domains
2. Add your domain
3. Follow DNS configuration instructions
4. SSL certificates are automatically provisioned by Vercel

