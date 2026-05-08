# Pre-Launch Checklist - OpenClaw Skills Marketplace

## 🔧 Development Setup

### Environment
- [ ] Node.js 18+ installed
- [ ] Git installed
- [ ] Code editor (VS Code recommended)

### Dependencies
- [ ] Run `npm install` successfully
- [ ] No dependency conflicts or vulnerabilities
- [ ] `.env.local` created and configured

## 🗄️ Database (Supabase)

### Project Setup
- [ ] Supabase project created
- [ ] Project name: openclaw-skills-marketplace
- [ ] Region selected appropriately

### Schema & Security
- [ ] `database/schema.sql` executed successfully
- [ ] `database/rls-policies.sql` executed successfully
- [ ] All 6 tables created (profiles, skills, purchases, reviews, seller_subscriptions, subscription_tiers)
- [ ] RLS enabled on all tables
- [ ] Default subscription tiers inserted

### Storage
- [ ] Storage bucket `skills` created
- [ ] Bucket permissions configured (public or private)
- [ ] File size limits set (recommended: 50MB max)

### API Keys
- [ ] Project URL copied to `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Anon key copied to `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Service role key copied to `SUPABASE_SERVICE_ROLE_KEY`
- [ ] ⚠️ Service role key kept secret (never in client-side code)

## 💳 Stripe

### Account Setup
- [ ] Stripe account created
- [ ] Test mode enabled for development
- [ ] Company/business details filled in

### API Keys
- [ ] Publishable key copied to `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] Secret key copied to `STRIPE_SECRET_KEY`
- [ ] Both keys are TEST mode keys (start with `pk_test_` and `sk_test_`)

### Webhooks (Development)
- [ ] Stripe CLI installed
- [ ] Webhook forwarding configured: `stripe listen --forward-to localhost:3000/api/webhook`
- [ ] Webhook secret copied to `STRIPE_WEBHOOK_SECRET`

### Webhooks (Production) - After deployment
- [ ] Webhook endpoint added in Stripe Dashboard
- [ ] Events selected: checkout.session.completed, customer.subscription.*
- [ ] Webhook secret updated in production environment

## 🚀 Local Testing

### Development Server
- [ ] `npm run dev` starts successfully
- [ ] Homepage loads at http://localhost:3000
- [ ] No console errors in browser

### Authentication Flow
- [ ] Can access signup page
- [ ] Can create new account
- [ ] Confirmation email received (check Supabase email logs)
- [ ] Can log in with created account
- [ ] Can log out successfully
- [ ] Session persists across page refreshes

### Marketplace Features
- [ ] Homepage displays "No skills" message (initially)
- [ ] Can filter by subject and difficulty
- [ ] Search page loads and works
- [ ] Can become a seller from dashboard

### Seller Features
- [ ] Upload skill page loads
- [ ] Can fill out skill upload form
- [ ] File upload field accepts .zip files
- [ ] Can submit free skill
- [ ] Can submit paid skill
- [ ] Skill appears in seller dashboard with "pending" status

### Payment Flow (Test Mode)
- [ ] Can view skill detail page
- [ ] Free skills show "Claim" button
- [ ] Paid skills show "Purchase" button
- [ ] Stripe checkout opens for paid skills
- [ ] Test card `4242 4242 4242 4242` works
- [ ] Redirects to success page after payment
- [ ] Purchase appears in dashboard
- [ ] Cannot purchase same skill twice

### Database Verification
- [ ] Check Supabase Table Editor for created records
- [ ] Verify RLS policies are working (can't see other users' data)
- [ ] Check uploaded files appear in Storage bucket

## 🔐 Security Checks

### Environment Variables
- [ ] `.env.local` is in `.gitignore`
- [ ] No secrets committed to git
- [ ] Service role key only used server-side
- [ ] All sensitive keys are in environment variables

### Row Level Security
- [ ] Users cannot edit other users' profiles
- [ ] Sellers cannot edit other sellers' skills
- [ ] Buyers cannot see other buyers' purchases
- [ ] Only approved skills visible to non-owners

### API Routes
- [ ] `/api/create-checkout` validates user session
- [ ] `/api/webhook` verifies Stripe signature
- [ ] No sensitive data exposed in API responses

## 📱 UI/UX Testing

### Responsive Design
- [ ] Works on mobile (375px width)
- [ ] Works on tablet (768px width)
- [ ] Works on desktop (1920px width)

### Dark Mode
- [ ] Dark mode activates based on system preference
- [ ] All text readable in dark mode
- [ ] All buttons and inputs styled correctly

### Accessibility
- [ ] Can navigate with keyboard (Tab key)
- [ ] Form labels present
- [ ] Error messages clear and helpful
- [ ] Color contrast sufficient

### Edge Cases
- [ ] Empty states display correctly (no skills, no purchases)
- [ ] Long skill names don't break layout
- [ ] Special characters in descriptions handled
- [ ] Large skill descriptions display properly

## 📝 Content & Copy

### Text Review
- [ ] No placeholder "Lorem ipsum" text
- [ ] Brand name spelled correctly everywhere
- [ ] Consistent tone and voice
- [ ] All error messages helpful and user-friendly

### Legal Pages (To Add)
- [ ] Terms of Service page
- [ ] Privacy Policy page
- [ ] Refund Policy page
- [ ] Links to legal pages in footer

## 🚢 Pre-Deployment (Production)

### Code Quality
- [ ] Run `npm run build` successfully
- [ ] Fix all TypeScript errors
- [ ] Fix all ESLint warnings
- [ ] Remove console.log statements
- [ ] Remove commented-out code

### Configuration
- [ ] Update `NEXT_PUBLIC_APP_URL` to production URL
- [ ] Switch Stripe to live mode keys
- [ ] Update Supabase redirect URLs
- [ ] Configure custom domain (if applicable)

### Testing
- [ ] Test complete user journey end-to-end
- [ ] Test payment flow with test card
- [ ] Test email notifications
- [ ] Test on multiple browsers (Chrome, Firefox, Safari)

## 📊 Post-Launch Monitoring

### First 24 Hours
- [ ] Monitor error logs in Vercel
- [ ] Check Stripe dashboard for payments
- [ ] Review Supabase logs for issues
- [ ] Test user signup flow again on production

### First Week
- [ ] Collect user feedback
- [ ] Fix critical bugs immediately
- [ ] Monitor performance metrics
- [ ] Review database for issues

### First Month
- [ ] Analyze user behavior
- [ ] Identify popular skills
- [ ] Review seller onboarding funnel
- [ ] Plan feature improvements

## 🎯 Marketing Checklist (Optional)

### Launch Preparation
- [ ] Create demo video/screenshots
- [ ] Write launch blog post
- [ ] Prepare social media posts
- [ ] Set up analytics (Google Analytics, Plausible, etc.)

### Launch Channels
- [ ] OpenClaw community Discord
- [ ] Product Hunt launch
- [ ] Reddit relevant subreddits
- [ ] Twitter announcement
- [ ] Newsletter to existing users

## ✅ Final Verification

Before going live:

1. **Delete test data** from production database
2. **Switch Stripe to live mode**
3. **Update all documentation** with production URLs
4. **Create first admin user**
5. **Upload 3-5 seed skills** for launch
6. **Test end-to-end one final time**

---

## 🐛 Common Issues & Solutions

### "Supabase client error"
→ Check API keys are correct and project is active

### "Stripe webhook signature invalid"
→ Verify webhook secret matches Stripe Dashboard

### "Cannot read properties of null"
→ User not authenticated, add session check

### "File upload failed"
→ Check storage bucket exists and permissions

### "RLS policy denies access"
→ Review policies in database, ensure user ID matches

---

**Ready to launch?** Check off all items above, then deploy with confidence! 🚀
