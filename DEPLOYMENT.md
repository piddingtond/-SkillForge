# Deployment Guide - OpenClaw Skills Marketplace

## Prerequisites

- Node.js 18+ installed
- Git installed
- Supabase account
- Stripe account
- Vercel account (recommended) or any Next.js hosting

---

## Step 1: Database Setup (Supabase)

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose organization and fill in:
   - **Name**: openclaw-skills-marketplace
   - **Database Password**: (generate a strong password)
   - **Region**: Choose closest to your users
4. Wait for project to be created (~2 minutes)

### 1.2 Run Database Schema

1. In your Supabase project, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `database/schema.sql`
4. Paste and click "Run"
5. Verify tables are created in **Table Editor**

### 1.3 Apply Row Level Security Policies

1. Still in **SQL Editor**, create another new query
2. Copy the entire contents of `database/rls-policies.sql`
3. Paste and click "Run"
4. This enables security policies and creates default subscription tiers

### 1.4 Create Storage Bucket

1. Go to **Storage** in sidebar
2. Click "New bucket"
3. Name it: `skills`
4. Set to **Public** (or Private with signed URLs)
5. Click "Create bucket"

### 1.5 Get API Keys

1. Go to **Project Settings** → **API**
2. Copy these values:
   - **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
   - **anon public** key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - **service_role** key (SUPABASE_SERVICE_ROLE_KEY) - Keep this secret!

---

## Step 2: Stripe Setup

### 2.1 Create Stripe Account

1. Go to [stripe.com](https://stripe.com) and sign up
2. Complete account verification
3. Switch to **Test mode** (toggle in top right)

### 2.2 Get API Keys

1. Go to **Developers** → **API keys**
2. Copy:
   - **Publishable key** (NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
   - **Secret key** (STRIPE_SECRET_KEY)

### 2.3 Set Up Products (Optional)

You can pre-create Stripe Products for your subscription tiers:
1. Go to **Products** → **Add product**
2. Create products for Pro ($19.99/month) and Business ($49.99/month)

Note: The app can also create products dynamically via API.

---

## Step 3: Local Development

### 3.1 Install Dependencies

```bash
cd G:\workspace\skill-finder
npm install
```

### 3.2 Configure Environment Variables

```bash
# Copy the example file
cp .env.local.example .env.local

# Edit .env.local with your values
```

Fill in `.env.local`:

```env
# Supabase (from Step 1.5)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe (from Step 2.2)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx  # Will get this in Step 3.4

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3.3 Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 3.4 Test Stripe Webhooks Locally

Install Stripe CLI:
```bash
# Windows (using Scoop)
scoop install stripe

# Or download from https://stripe.com/docs/stripe-cli
```

Forward webhooks to local server:
```bash
stripe listen --forward-to localhost:3000/api/webhook
```

Copy the webhook signing secret (starts with `whsec_`) and add to `.env.local`:
```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

Restart your dev server after updating env vars.

---

## Step 4: Deploy to Production (Vercel)

### 4.1 Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: OpenClaw Skills Marketplace"
git remote add origin https://github.com/yourusername/openclaw-marketplace.git
git push -u origin main
```

### 4.2 Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Framework preset will auto-detect: **Next.js**
5. Add all environment variables from `.env.local` (except STRIPE_WEBHOOK_SECRET for now)
6. Change `NEXT_PUBLIC_APP_URL` to your production URL (e.g., `https://openclaw-marketplace.vercel.app`)
7. Click "Deploy"

### 4.3 Set Up Production Stripe Webhook

1. After deployment completes, copy your production URL
2. Go to Stripe Dashboard → **Developers** → **Webhooks**
3. Click "Add endpoint"
4. Set endpoint URL: `https://your-domain.vercel.app/api/webhook`
5. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
6. Click "Add endpoint"
7. Copy the **Signing secret** (starts with `whsec_`)
8. In Vercel, go to **Settings** → **Environment Variables**
9. Add: `STRIPE_WEBHOOK_SECRET` = `whsec_xxxxx`
10. Redeploy the app (Vercel → Deployments → ⋯ → Redeploy)

### 4.4 Switch Stripe to Live Mode

When ready to accept real payments:
1. Complete Stripe account verification
2. Switch to **Live mode** in Stripe Dashboard
3. Get new Live API keys from **Developers** → **API keys**
4. Update environment variables in Vercel:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → Live publishable key
   - `STRIPE_SECRET_KEY` → Live secret key
5. Create new webhook for live mode (same URL, get new signing secret)
6. Update `STRIPE_WEBHOOK_SECRET` in Vercel
7. Redeploy

---

## Step 5: Post-Deployment Configuration

### 5.1 Update Supabase Auth Settings

1. In Supabase: **Authentication** → **URL Configuration**
2. Add your production URL to:
   - **Site URL**: `https://your-domain.vercel.app`
   - **Redirect URLs**: `https://your-domain.vercel.app/**`

### 5.2 Create Admin User

1. Sign up on your production site
2. In Supabase: **Table Editor** → **profiles**
3. Find your user and change `role` to `admin`

### 5.3 Test Complete Flow

1. Sign up as a new user
2. Become a seller
3. Upload a test skill
4. As admin, approve the skill (change status in database)
5. Purchase the skill with test card: `4242 4242 4242 4242`

---

## Troubleshooting

### Database Connection Issues
- Check Supabase project is active
- Verify API keys are correct
- Check RLS policies are applied

### Stripe Payment Failures
- Verify webhook endpoint is accessible
- Check webhook signing secret matches
- Review Stripe logs in Dashboard → Developers → Logs

### File Upload Issues
- Verify storage bucket exists and is configured
- Check bucket permissions (public/private)
- Ensure file size limits are appropriate

### Build Errors
- Clear `.next` folder: `rm -rf .next`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run lint`

---

## Monitoring & Maintenance

### Daily
- Check Stripe dashboard for payment issues
- Monitor error logs in Vercel

### Weekly
- Review pending skills for approval (build admin dashboard)
- Check user feedback and reviews

### Monthly
- Review Supabase usage and upgrade plan if needed
- Review Stripe fees and subscription metrics
- Backup database (Supabase auto-backups, but export manually too)

---

## Security Checklist

✅ RLS policies enabled on all tables
✅ Service role key only on server-side
✅ Stripe webhook signature verification
✅ File upload size limits configured
✅ HTTPS enabled in production
✅ Environment variables secured (not in git)
✅ Database backups configured

---

## Next Features to Build

1. **Email notifications** (purchase confirmations, skill approvals)
2. **Admin dashboard** (approve/reject skills, view analytics)
3. **Seller analytics** (revenue, downloads, trending)
4. **Skill reviews** (buyers can rate/review after purchase)
5. **Skill categories/tags** (better organization)
6. **Search improvements** (full-text search, filters)
7. **Subscription management UI** (cancel, upgrade/downgrade)
8. **Skill updates** (versioning, update notifications)

---

## Support Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Stripe Docs](https://stripe.com/docs)
- [Vercel Docs](https://vercel.com/docs)

Need help? Create an issue in the GitHub repo!
