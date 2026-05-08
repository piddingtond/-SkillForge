# OpenClaw Skills Marketplace

A complete Next.js 14 SaaS marketplace for buying and selling OpenClaw skills, with Supabase authentication and Stripe payments.

## Features

✅ **User Authentication** - Login/signup with Supabase Auth
✅ **Browse Skills** - Filter by subject and difficulty  
✅ **Skill Details** - Full descriptions, ratings, and reviews  
✅ **Purchase Flow** - Stripe checkout for paid skills  
✅ **Seller Dashboard** - Upload and manage skills  
✅ **Free & Paid Skills** - Support for both pricing models  
✅ **User Profiles** - Buyer and seller roles  
✅ **Reviews & Ratings** - Community feedback system  
✅ **Subscription Tiers** - For sellers (infrastructure ready)

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe
- **File Storage**: Supabase Storage

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL schema from `database/schema.sql` in the SQL editor
3. Create a storage bucket named `skills` (public or private based on preference)
4. Copy your project URL and anon key

### 3. Set Up Stripe

1. Create an account at [stripe.com](https://stripe.com)
2. Get your API keys from the dashboard
3. Set up a webhook endpoint pointing to: `https://yourdomain.com/api/webhook`
4. Copy the webhook signing secret

### 4. Configure Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The app uses these main tables:

- **profiles** - User accounts with buyer/seller roles
- **skills** - Skill listings with metadata
- **purchases** - Transaction records
- **reviews** - Ratings and comments
- **seller_subscriptions** - Subscription management (optional)
- **subscription_tiers** - Pricing tiers for sellers (optional)

Row Level Security (RLS) policies are already configured in the schema.

## Project Structure

```
app/
├── api/
│   ├── create-checkout/    # Stripe checkout session
│   └── webhook/             # Stripe webhook handler
├── dashboard/
│   ├── upload/              # Skill upload page
│   └── page.tsx             # User dashboard
├── login/                   # Login page
├── signup/                  # Signup page
├── skills/[id]/             # Skill detail page
├── purchase-success/        # Post-purchase redirect
├── layout.tsx               # Root layout
└── page.tsx                 # Homepage (browse skills)

components/
└── SkillCard.tsx            # Reusable skill card

lib/
├── supabase.ts              # Supabase client & types
├── stripe.ts                # Stripe client
└── constants.ts             # Shared constants

database/
└── schema.sql               # Database schema
```

## Usage

### As a Buyer

1. Sign up for an account
2. Browse skills on the homepage
3. Click a skill to view details
4. Purchase (or claim free skills)
5. Access purchased skills in your dashboard

### As a Seller

1. Sign up for an account
2. Click "Become a Seller" in your dashboard
3. Upload skills with descriptions, pricing, and files
4. Manage your listings and view analytics
5. Track downloads and earnings

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in project settings
4. Deploy!

### Update Stripe Webhook

After deployment, update your Stripe webhook URL to:
```
https://yourdomain.com/api/webhook
```

## Development Notes

- The original React skill finder UI has been preserved (purple brand color #534AB7)
- All database operations use Supabase client with RLS
- Stripe handles all payment processing securely
- File uploads go to Supabase Storage
- Skills require approval before appearing (status: pending → approved)

## Next Steps

- [ ] Add email notifications (Supabase Auth emails, purchase confirmations)
- [ ] Implement seller subscription tiers
- [ ] Add advanced search and filtering
- [ ] Build seller analytics dashboard
- [ ] Add skill reviews and ratings UI for buyers
- [ ] Implement skill updates/versioning
- [ ] Add categories/tags system
- [ ] Create admin panel for skill approval

## Support

For issues or questions, refer to:
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Stripe Docs](https://stripe.com/docs)

---

Built with ❤️ for the OpenClaw community
