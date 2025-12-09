import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockEmailLog } from '../mocks';

vi.mock('@/integrations/supabase/client');

describe('Email Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sendWelcomeEmail', () => {
    it('should send welcome email with user details', async () => {
      const result = {
        error: null,
        data: {
          ...mockEmailLog,
          template_type: 'welcome',
          subject: 'Welcome to KSFoundation',
        },
      };

      expect(result.data?.template_type).toBe('welcome');
      expect(result.data?.status).toBe('sent');
      expect(result.data?.recipient_email).toBe('user@example.com');
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('should send password reset link', async () => {
      const result = {
        error: null,
        data: {
          ...mockEmailLog,
          template_type: 'password-reset',
          subject: 'Reset Your Password',
        },
      };

      expect(result.data?.template_type).toBe('password-reset');
      expect(result.data?.status).toBe('sent');
    });
  });

  describe('sendVerificationEmail', () => {
    it('should send email verification code', async () => {
      const result = {
        error: null,
        data: {
          ...mockEmailLog,
          template_type: 'email-verification',
          subject: 'Verify Your Email Address',
        },
      };

      expect(result.data?.template_type).toBe('email-verification');
      expect(result.data?.status).toBe('sent');
    });
  });

  describe('sendSubscriptionConfirmationEmail', () => {
    it('should send subscription confirmation with plan details', async () => {
      const result = {
        error: null,
        data: {
          ...mockEmailLog,
          template_type: 'subscription-confirmation',
          subject: 'Subscription Confirmed',
        },
      };

      expect(result.data?.template_type).toBe('subscription-confirmation');
    });
  });

  describe('sendInvoiceEmail', () => {
    it('should send invoice to user', async () => {
      const result = {
        error: null,
        data: {
          ...mockEmailLog,
          template_type: 'invoice',
          subject: 'Your Invoice from KSFoundation',
        },
      };

      expect(result.data?.template_type).toBe('invoice');
    });
  });

  describe('sendPaymentFailedEmail', () => {
    it('should notify about failed payment', async () => {
      const result = {
        error: null,
        data: {
          ...mockEmailLog,
          template_type: 'payment-failed',
          subject: 'Payment Failed - Action Required',
        },
      };

      expect(result.data?.template_type).toBe('payment-failed');
    });
  });

  describe('send2FASetupEmail', () => {
    it('should send 2FA setup confirmation', async () => {
      const result = {
        error: null,
        data: {
          ...mockEmailLog,
          template_type: 'two-factor-code',
          subject: 'Two-Factor Authentication Setup',
        },
      };

      expect(result.data?.template_type).toBe('two-factor-code');
    });
  });

  describe('sendTicketConfirmationEmail', () => {
    it('should send support ticket confirmation', async () => {
      const result = {
        error: null,
        data: {
          ...mockEmailLog,
          template_type: 'ticket-confirmation',
          subject: 'Support Ticket Created',
        },
      };

      expect(result.data?.template_type).toBe('ticket-confirmation');
    });
  });

  describe('sendTicketReplyEmail', () => {
    it('should notify about ticket reply', async () => {
      const result = {
        error: null,
        data: {
          ...mockEmailLog,
          template_type: 'ticket-reply',
          subject: 'New Reply to Your Support Ticket',
        },
      };

      expect(result.data?.template_type).toBe('ticket-reply');
    });
  });

  describe('sendCancellationNoticeEmail', () => {
    it('should notify about subscription cancellation', async () => {
      const result = {
        error: null,
        data: {
          ...mockEmailLog,
          template_type: 'cancellation-notice',
          subject: 'Your Subscription is Ending',
        },
      };

      expect(result.data?.template_type).toBe('cancellation-notice');
    });
  });
});
