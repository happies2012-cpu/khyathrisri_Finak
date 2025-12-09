# Payment Integration Setup Guide

This document outlines the setup steps required to enable Stripe payments in the KSFoundation hosting platform.

## Overview

The payment system integrates Stripe with Supabase to handle:
- Subscription management (Starter, Business, Enterprise plans)
- Invoice generation and tracking
- Payment method management
- Webhook handling for real-time payment updates

## Files Created

### Backend Services
- `src/services/paymentService.ts` - Main payment service with 8 functions
- `supabase/migrations/20251209_payments.sql` - Database tables and RLS policies

### Supabase Edge Functions
- `supabase/functions/create-checkout-session/index.ts` - Stripe checkout creation
- `supabase/functions/stripe-webhook/index.ts` - Webhook handler
- `supabase/functions/cancel-subscription/index.ts` - Subscription cancellation
- `supabase/functions/reactivate-subscription/index.ts` - Subscription reactivation
- `supabase/functions/create-billing-portal-session/index.ts` - Billing portal access

### Frontend Components
- `src/pages/Billing.tsx` - Updated to use real payment service

## Setup Instructions

### 1. Stripe Account Setup

1. Create a Stripe account at https://stripe.com
2. Go to Dashboard > Developers > API keys
3. Note your:
   - Public Key (starts with `pk_`)
   - Secret Key (starts with `sk_`)
4. Create three price objects in Stripe:
   - **Starter**: $4.99/month
   - **Business**: $9.99/month  
   - **Enterprise**: $29.99/month
5. Note the Price IDs for each plan (starts with `price_`)

### 2. Supabase Configuration

#### Create Environment Variables
Add to your `.env.local`:
```
VITE_STRIPE_PUBLIC_KEY=pk_your_public_key_here
STRIPE_SECRET_KEY=sk_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
STRIPE_PRICE_STARTER=price_starter_id_here
STRIPE_PRICE_BUSINESS=price_business_id_here
STRIPE_PRICE_ENTERPRISE=price_enterprise_id_here
PUBLIC_URL=http://localhost:5173
```

#### Apply Database Migration
```bash
supabase migration up 20251209_payments
```

This creates:
- `subscriptions` table - Tracks user subscriptions
- `invoices` table - Stores invoice records
- `payment_methods` table - Manages payment methods
- `billing_events` table - Webhook event tracking

### 3. Deploy Edge Functions

Deploy the Stripe webhook handler and other functions to Supabase:

```bash
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook
supabase functions deploy cancel-subscription
supabase functions deploy reactivate-subscription
supabase functions deploy create-billing-portal-session
```

### 4. Configure Stripe Webhooks

1. In Stripe Dashboard, go to Developers > Webhooks
2. Click "Add endpoint"
3. Enter your Supabase function URL: `https://[project-id].supabase.co/functions/v1/stripe-webhook`
4. Select events to listen for:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `payment_method.attached`
   - `payment_method.detached`
5. Copy the Webhook Signing Secret and set as `STRIPE_WEBHOOK_SECRET`

### 5. Install Stripe Client Library

The service already handles calls to Stripe through Edge Functions, but for advanced features, you may want to install Stripe.js:

```bash
npm install @stripe/js
```

## Payment Flow

### User Upgrading Plan
1. User clicks "Upgrade" on desired plan
2. `createCheckoutSession()` is called
3. Stripe checkout page opens
4. After successful payment:
   - Stripe creates subscription
   - Webhook is triggered
   - `subscriptions` table updated
   - User profile updated with new plan
   - User redirected to billing page

### Webhook Processing
When Stripe sends webhook events:
1. `stripe-webhook` function validates signature
2. Event is stored in `billing_events` table
3. Appropriate handler processes event:
   - **subscription.created/updated** → Update `subscriptions` table, sync plan
   - **subscription.deleted** → Mark subscription canceled, reset to free plan
   - **invoice.paid** → Create invoice record
   - **invoice.payment_failed** → Mark invoice open

### Cancellation Flow
1. User clicks "Cancel Subscription"
2. `cancelSubscription()` calls edge function
3. `cancel_at_period_end` flag set in Stripe
4. User can still use service until period end
5. At period end, Stripe triggers cancellation webhook
6. User automatically downgraded to free plan

## API Service Functions

### `createCheckoutSession(userId, planName)`
Creates a Stripe checkout session for upgrading subscription.

### `getSubscription(userId)`
Retrieves user's current subscription status.

### `getInvoices(userId, limit)`
Gets list of user's invoices.

### `getPaymentMethods(userId)`
Lists user's saved payment methods.

### `setDefaultPaymentMethod(userId, paymentMethodId)`
Sets which payment method to use by default.

### `deletePaymentMethod(paymentMethodId)`
Removes a saved payment method.

### `cancelSubscription(userId)`
Cancels subscription at end of billing period.

### `reactivateSubscription(userId)`
Reactivates a subscription marked for cancellation.

### `createBillingPortalSession(userId)`
Creates session for Stripe Billing Portal access.

## Testing

### Without Real Stripe Account
The payment service is designed to gracefully handle missing tables:
- Returns empty subscriptions/invoices if tables don't exist
- Toast notifications inform user
- No blocking errors

### With Test Mode
Use Stripe test keys (starts with `pk_test_` and `sk_test_`)
Test card numbers:
- `4242 4242 4242 4242` - Success
- `4000 0000 0000 0002` - Declined
- `4000 0025 0000 3155` - 3D Secure required

## Database Schema

### subscriptions
```sql
- id (UUID, PK)
- user_id (UUID, FK → auth.users)
- stripe_customer_id (TEXT, UNIQUE)
- stripe_subscription_id (TEXT, UNIQUE)
- plan_name (free|starter|business|enterprise)
- status (active|past_due|canceled|unpaid)
- current_period_start (TIMESTAMP)
- current_period_end (TIMESTAMP)
- cancel_at_period_end (BOOLEAN)
- created_at, updated_at (TIMESTAMP)
```

### invoices
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- stripe_invoice_id (TEXT, UNIQUE)
- amount (INTEGER, cents)
- currency (TEXT)
- status (draft|open|paid|void|uncollectible)
- invoice_pdf (TEXT, URL)
- created_at, due_date, paid_at (TIMESTAMP)
```

### payment_methods
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- stripe_payment_method_id (TEXT, UNIQUE)
- type (card|bank_account)
- card_brand (visa|mastercard|amex)
- card_last_four (TEXT)
- exp_month, exp_year (INTEGER)
- is_default (BOOLEAN)
- created_at (TIMESTAMP)
```

## Security Considerations

1. **API Keys**: Store secret keys in environment variables, never in code
2. **RLS Policies**: All tables have row-level security enabled
3. **Webhook Validation**: Edge functions validate Stripe signatures
4. **User Isolation**: Users can only access their own data
5. **Billing Events**: Event table disabled to users, only system access

## Troubleshooting

### "Subscription table not found"
- Migration hasn't been applied yet
- Run: `supabase migration up 20251209_payments`

### Webhook not firing
- Check webhook URL in Stripe dashboard
- Verify API key in edge function environment
- Check Stripe logs for delivery failures

### Payment method not saving
- Ensure `payment_methods` table exists
- Check payment method RLS policies
- Verify user ID is set correctly

## Next Steps

1. Set up Stripe account and keys
2. Configure environment variables
3. Apply database migration
4. Deploy edge functions
5. Add webhook endpoint in Stripe
6. Test checkout flow with test cards
7. Deploy to production with live keys

## Support

For issues:
- Check Stripe dashboard logs
- Review Supabase function logs
- Verify database migration applied
- Check RLS policies are enabled
