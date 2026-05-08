# OpenClaw Skills Marketplace

**Status:** In Development  
**Progress:** Database schema complete, building features...

---

## What This Is

A SaaS marketplace where skill creators can sell OpenClaw skills. Sellers pay monthly subscriptions to list skills, buyers can browse and purchase.

---

## Tech Stack

- **Frontend:** Next.js 14 + React + Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Payments:** Stripe
- **Deployment:** Vercel

---

## Subscription Tiers (Sellers)

| Tier | Price | Max Skills | Features |
|------|-------|------------|----------|
| **Free** | $0/mo | 1 | Basic analytics, Community support |
| **Basic** | $9/mo | 5 | Full analytics, Email support, Seller badge |
| **Pro** | $29/mo | Unlimited | Advanced analytics, Priority support, Featured placement |
| **Enterprise** | $99/mo | Unlimited | White-label, Dedicated support, Custom branding |

---

## Setup Instructions

### 1. Install Dependencies

```bash
cd G:\workspace\skill-finder
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Copy Project URL and anon key
4. Run database migrations:
   - Go to SQL Editor in Supabase
   - Run `database/schema.sql`
   - Run `database/policies.sql`
   - Run `database/seed.sql`

### 3. Set Up Stripe

1. Go to [stripe.com](https://stripe.com)
2. Create account
3. Get API keys from Dashboard
4. Set up webhook endpoint (later)

### 4. Configure Environment

```bash
cp .env.example .env.local
# Edit .env.local with your keys
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Database Schema

### Tables:
- **profiles** - User accounts (buyers & sellers)
- **subscription_tiers** - Pricing tiers
- **seller_subscriptions** - Active seller subscriptions
- **skills** - Skill listings
- **purchases** - Buyer transactions
- **reviews** - Skill ratings & comments

See `database/schema.sql` for full structure.

---

## Features (In Progress)

### ✅ Phase 1: Database
- [x] Schema design
- [x] Row Level Security
- [x] Subscription tiers

### 🔄 Phase 2: Authentication
- [ ] Supabase Auth integration
- [ ] Login/Signup pages
- [ ] User profiles

### 🔄 Phase 3: Skill Browsing
- [ ] Skill cards
- [ ] Search & filters
- [ ] Quiz recommendations
- [ ] Skill detail pages

### 🔄 Phase 4: Seller Dashboard
- [ ] Upload skills
- [ ] Manage listings
- [ ] Analytics
- [ ] Earnings reports

### 🔄 Phase 5: Payments
- [ ] Stripe integration
- [ ] Checkout flow
- [ ] Subscription management
- [ ] Webhooks

### 🔄 Phase 6: Downloads
- [ ] Skill file hosting
- [ ] Download tracking
- [ ] Email delivery

### 🔄 Phase 7: Reviews
- [ ] Rating system
- [ ] Comments
- [ ] Moderation

---

## Progress Log

**2026-04-17 03:35:**
- ✅ Database schema complete
- ✅ Security policies complete
- ✅ Seed data complete
- ✅ Project structure created
- ⏳ Next: Auth pages

---

## File Structure

```
skill-finder/
├── database/
│   ├── schema.sql          # Database tables
│   ├── policies.sql        # Row Level Security
│   └── seed.sql            # Initial data
├── skills-data.js          # Original 24 skills data
├── App.jsx                 # Original skill finder UI
├── package.json            # Dependencies
├── .env.example            # Environment template
└── README.md               # This file
```

---

**Built by:** Athena AI  
**For:** Daniel (OpenClaw Skills Marketplace MVP)
