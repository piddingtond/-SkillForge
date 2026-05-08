# Critical Issue #1: Secure Environment Variables

## Problem
Environment variables in `.env.local` are stored in plain text. If the file leaks, attackers get full access.

## Solution (Pragmatic)
Since we're using Vercel for deployment, we'll use **Vercel's built-in secret management** instead of local encryption.

### For Local Development:
1. Create `.env.local` with **file permissions set to 600** (owner-only)
2. Add to `.gitignore` (already done)
3. Never commit to git

### For Production:
1. Store secrets in Vercel environment variables (encrypted at rest)
2. Use Vercel CLI to manage secrets
3. Rotate keys quarterly

## Implementation

### Step 1: Secure Local .env.local

```powershell
# Windows - Use icacls to restrict permissions
cd G:\workspace\skill-finder

# Create .env.local if it doesn't exist
if (!(Test-Path .env.local)) {
    Copy-Item .env.local.example .env.local
}

# Set owner-only permissions (equivalent to chmod 600)
icacls .env.local /inheritance:r
icacls .env.local /grant:r "${env:USERNAME}:(R,W)"
```

### Step 2: Add to .gitignore

```
# Already in .gitignore:
.env.local
.env*.local
```

### Step 3: Use Vercel Secrets for Production

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Add production secrets (encrypted)
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add STRIPE_SECRET_KEY
vercel env add STRIPE_WEBHOOK_SECRET
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```

Vercel stores these encrypted and injects them at runtime. Much better than local file encryption.

## Bonus: Secrets Rotation

Create a reminder to rotate keys:

```markdown
## Quarterly Security Review
- [ ] Rotate Supabase service role key
- [ ] Rotate Stripe API keys
- [ ] Review access logs
- [ ] Update webhook secrets
```

## Status: ✅ SOLVED
- Local: File permissions + gitignore
- Production: Vercel encrypted environment variables
- No need for custom encryption layer
