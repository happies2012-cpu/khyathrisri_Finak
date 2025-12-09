# Email Notification System Setup Guide

This document outlines the setup steps required to enable email notifications in the KSFoundation hosting platform.

## Overview

The email system integrates Resend (email service provider) with Supabase to handle:
- Transactional emails (signup, password reset, verification)
- Invoice and billing notifications
- Support ticket updates
- Two-factor authentication codes
- Subscription change notifications
- Marketing communications with preference management

## Files Created

### Backend Services
- `src/services/emailService.ts` - Main email service with 11 functions
- `supabase/migrations/20251209_email_system.sql` - Database tables for email logging and preferences

### Supabase Edge Function
- `supabase/functions/send-email/index.ts` - Email sending service with built-in templates

### Frontend Components
- `src/components/auth/EmailPreferences.tsx` - User email preference management UI

## Setup Instructions

### 1. Resend Account Setup

1. Create a free account at https://resend.com
2. Verify your domain or use the default `resend.com` domain
3. Go to API Keys section and copy your API key
4. Set environment variable: `RESEND_API_KEY=re_your_api_key_here`

### 2. Environment Variables

Add to `.env.local`:
```
RESEND_API_KEY=re_your_api_key_here
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Apply Database Migration

```bash
supabase migration up 20251209_email_system
```

This creates:
- `email_logs` table - Tracks all sent emails with status
- `email_preferences` table - Stores user communication preferences
- Automatic preference initialization on user signup

### 4. Deploy Edge Function

```bash
supabase functions deploy send-email
```

### 5. Update Supabase Domain (Production)

For production, configure your domain in Resend:
1. Resend Dashboard → Settings → Domains
2. Add your domain (e.g., `mail.ksfoundation.com`)
3. Add DNS records provided by Resend
4. Update sender email in `send-email/index.ts`: `from: 'noreply@mail.ksfoundation.com'`

## Email Templates

The system includes 10 pre-built email templates:

### Transactional Emails
- **welcome** - New user signup confirmation
- **password-reset** - Password recovery link
- **email-verification** - Email address verification
- **2fa-setup-confirmation** - 2FA successfully enabled

### Billing Emails
- **subscription-confirmation** - Plan upgrade confirmation
- **invoice** - Monthly invoice with download link
- **payment-failed** - Payment failure notice with retry option
- **cancellation-notice** - Subscription cancellation warning

### Support Emails
- **ticket-confirmation** - New support ticket received
- **ticket-reply** - Support team response notification

### Authentication Emails
- **two-factor-code** - 2FA code delivery

## API Service Functions

### User-Triggered Emails

#### `sendWelcomeEmail(email, fullName)`
Sends welcome message to new users. Called automatically on signup.

#### `sendPasswordResetEmail(email, resetLink)`
Sends password reset link. Called from password reset flow.

#### `sendVerificationEmail(email, verificationLink)`
Sends email verification link. Called from email verification flow.

#### `sendTwoFactorEmail(email, code)`
Sends 2FA code. Called during MFA challenge.

#### `send2FASetupEmail(email, fullName)`
Confirms 2FA setup completion.

### Billing Emails

#### `sendSubscriptionConfirmationEmail(email, fullName, planName, amount, invoiceUrl)`
Sends plan upgrade confirmation with receipt.

#### `sendInvoiceEmail(email, fullName, invoiceId, amount, invoiceUrl)`
Sends monthly invoice with PDF download link.

#### `sendPaymentFailedEmail(email, fullName, amount, reason)`
Alerts user of payment failure with recovery options.

#### `sendCancellationNoticeEmail(email, fullName, cancelDate)`
Warns user before subscription cancellation.

### Support Emails

#### `sendTicketConfirmationEmail(email, fullName, ticketId, subject)`
Confirms support ticket creation with tracking link.

#### `sendTicketReplyEmail(email, fullName, ticketId, replyPreview)`
Notifies user of new support response.

### Custom Emails

#### `sendCustomEmail(options)`
Send custom HTML emails with custom subject and content.

## Integration Points

### In useAuth.tsx
```typescript
// Automatically called on signup
await sendWelcomeEmail(email, fullName);
```

### In Billing.tsx
```typescript
// After successful payment (via webhook)
await sendSubscriptionConfirmationEmail(email, name, plan, amount);

// After payment failure (via webhook)
await sendPaymentFailedEmail(email, name, amount, reason);
```

### In Support Flow
```typescript
// After ticket creation
await sendTicketConfirmationEmail(email, name, ticketId, subject);

// After support reply
await sendTicketReplyEmail(email, name, ticketId, preview);
```

## Database Schema

### email_logs
```sql
- id (UUID, PK)
- user_id (UUID, FK → auth.users)
- recipient_email (TEXT)
- template_name (TEXT)
- subject (TEXT)
- status (sent|failed|bounced)
- error_message (TEXT)
- created_at (TIMESTAMP)
- sent_at (TIMESTAMP)
- opens (INTEGER)
- clicks (INTEGER)
```

### email_preferences
```sql
- id (UUID, PK)
- user_id (UUID, FK, UNIQUE)
- marketing_emails (BOOLEAN)
- transactional_emails (BOOLEAN)
- invoice_emails (BOOLEAN)
- ticket_updates (BOOLEAN)
- security_alerts (BOOLEAN)
- newsletter (BOOLEAN)
- updated_at (TIMESTAMP)
```

## Email Preference Preferences Component

Users can customize their email preferences via `EmailPreferences` component:

```typescript
import EmailPreferences from '@/components/auth/EmailPreferences';

export default function SettingsPage() {
  return (
    <div>
      <EmailPreferences />
    </div>
  );
}
```

Features:
- ✅ Essential emails are required (marked as disabled)
- ✅ Optional emails can be toggled on/off
- ✅ Changes saved to database immediately
- ✅ Respects user preferences in all email sends

## Security & Best Practices

1. **API Key Security**
   - Store Resend API key in environment variables only
   - Never commit to version control
   - Rotate keys regularly

2. **Email Validation**
   - All email addresses validated before sending
   - Failed emails logged with error messages
   - Failed email tracking for debugging

3. **Preferences Respect**
   - Always check user preferences before sending
   - Skip emails if user opted out
   - Exception: Security alerts are mandatory

4. **Rate Limiting**
   - Resend has built-in rate limiting
   - Monitor email_logs for failures
   - Implement retry logic for failed sends

## Testing

### Development
Use Resend test mode:
```
RESEND_API_KEY=re_test_123456789
```

Test emails go to Resend's mock mailbox.

### Production
1. Start with small user base
2. Monitor email_logs for delivery issues
3. Check Resend dashboard for bounces
4. Implement bounce handling

## Troubleshooting

### Emails not sending
- Check RESEND_API_KEY is set correctly
- Verify edge function deployed: `supabase functions list`
- Check function logs: `supabase functions logs send-email`
- Confirm email migration applied: `supabase db pull`

### Emails going to spam
- Add SPF record to your domain
- Add DKIM record via Resend dashboard
- Add DMARC policy
- Use branded domain instead of `resend.com`

### High bounce rate
- Check recipient emails are valid
- Verify email preferences loaded correctly
- Monitor email_logs for failure patterns

### Migration issues
- Run: `supabase migration up --dry-run 20251209_email_system`
- Check Supabase dashboard for table creation
- Verify RLS policies are enabled

## Next Steps

1. Create Resend account and get API key
2. Set RESEND_API_KEY environment variable
3. Apply email_system migration
4. Deploy send-email edge function
5. Test with welcome email on signup
6. Monitor email_logs for successful sends
7. Configure custom domain (production)
8. Set up bounce handling
9. Add email preferences to settings page
10. Monitor delivery metrics

## Support

For issues:
- Check Resend dashboard error logs
- Review Supabase function logs
- Verify email_preferences table exists
- Check email_logs for failure reasons
- Test with custom email first
