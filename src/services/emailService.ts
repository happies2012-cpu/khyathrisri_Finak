import { supabase } from '@/integrations/supabase/client';

export interface EmailTemplate {
  name: string;
  subject: string;
  html: string;
  textContent?: string;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

/**
 * Send email for successful registration
 */
export async function sendWelcomeEmail(email: string, fullName: string): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.functions.invoke('send-email', {
      body: {
        to: email,
        template: 'welcome',
        variables: {
          fullName,
          loginUrl: `${window.location.origin}/auth`,
        },
      },
    });

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return { error: error instanceof Error ? error : new Error('Failed to send email') };
  }
}

/**
 * Send email for password reset
 */
export async function sendPasswordResetEmail(email: string, resetLink: string): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.functions.invoke('send-email', {
      body: {
        to: email,
        template: 'password-reset',
        variables: {
          resetLink,
          expiresIn: '1 hour',
        },
      },
    });

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    return { error: error instanceof Error ? error : new Error('Failed to send email') };
  }
}

/**
 * Send email for email verification
 */
export async function sendVerificationEmail(email: string, verificationLink: string): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.functions.invoke('send-email', {
      body: {
        to: email,
        template: 'email-verification',
        variables: {
          verificationLink,
          expiresIn: '24 hours',
        },
      },
    });

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return { error: error instanceof Error ? error : new Error('Failed to send email') };
  }
}

/**
 * Send subscription confirmation email
 */
export async function sendSubscriptionConfirmationEmail(
  email: string,
  fullName: string,
  planName: string,
  amount: number,
  invoiceUrl?: string
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.functions.invoke('send-email', {
      body: {
        to: email,
        template: 'subscription-confirmation',
        variables: {
          fullName,
          planName,
          amount: `$${(amount / 100).toFixed(2)}`,
          invoiceUrl: invoiceUrl || '#',
          billingUrl: `${window.location.origin}/billing`,
        },
      },
    });

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Failed to send subscription confirmation email:', error);
    return { error: error instanceof Error ? error : new Error('Failed to send email') };
  }
}

/**
 * Send invoice email
 */
export async function sendInvoiceEmail(
  email: string,
  fullName: string,
  invoiceId: string,
  amount: number,
  invoiceUrl: string
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.functions.invoke('send-email', {
      body: {
        to: email,
        template: 'invoice',
        variables: {
          fullName,
          invoiceId,
          amount: `$${(amount / 100).toFixed(2)}`,
          invoiceUrl,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        },
      },
    });

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Failed to send invoice email:', error);
    return { error: error instanceof Error ? error : new Error('Failed to send email') };
  }
}

/**
 * Send payment failed notification
 */
export async function sendPaymentFailedEmail(
  email: string,
  fullName: string,
  amount: number,
  reason: string
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.functions.invoke('send-email', {
      body: {
        to: email,
        template: 'payment-failed',
        variables: {
          fullName,
          amount: `$${(amount / 100).toFixed(2)}`,
          reason,
          actionUrl: `${window.location.origin}/billing`,
        },
      },
    });

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Failed to send payment failed email:', error);
    return { error: error instanceof Error ? error : new Error('Failed to send email') };
  }
}

/**
 * Send support ticket confirmation
 */
export async function sendTicketConfirmationEmail(
  email: string,
  fullName: string,
  ticketId: string,
  subject: string
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.functions.invoke('send-email', {
      body: {
        to: email,
        template: 'ticket-confirmation',
        variables: {
          fullName,
          ticketId,
          subject,
          trackingUrl: `${window.location.origin}/support?ticket=${ticketId}`,
        },
      },
    });

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Failed to send ticket confirmation email:', error);
    return { error: error instanceof Error ? error : new Error('Failed to send email') };
  }
}

/**
 * Send support ticket reply notification
 */
export async function sendTicketReplyEmail(
  email: string,
  fullName: string,
  ticketId: string,
  replyPreview: string
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.functions.invoke('send-email', {
      body: {
        to: email,
        template: 'ticket-reply',
        variables: {
          fullName,
          ticketId,
          replyPreview,
          viewUrl: `${window.location.origin}/support?ticket=${ticketId}`,
        },
      },
    });

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Failed to send ticket reply email:', error);
    return { error: error instanceof Error ? error : new Error('Failed to send email') };
  }
}

/**
 * Send two-factor authentication code
 */
export async function sendTwoFactorEmail(email: string, code: string): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.functions.invoke('send-email', {
      body: {
        to: email,
        template: 'two-factor-code',
        variables: {
          code,
          expiresIn: '10 minutes',
        },
      },
    });

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Failed to send 2FA email:', error);
    return { error: error instanceof Error ? error : new Error('Failed to send email') };
  }
}

/**
 * Send subscription cancellation notice
 */
export async function sendCancellationNoticeEmail(
  email: string,
  fullName: string,
  cancelDate: Date
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.functions.invoke('send-email', {
      body: {
        to: email,
        template: 'cancellation-notice',
        variables: {
          fullName,
          cancelDate: cancelDate.toLocaleDateString(),
          reactivateUrl: `${window.location.origin}/billing`,
        },
      },
    });

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Failed to send cancellation notice:', error);
    return { error: error instanceof Error ? error : new Error('Failed to send email') };
  }
}

/**
 * Send notification of successful 2FA setup
 */
export async function send2FASetupEmail(email: string, fullName: string): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.functions.invoke('send-email', {
      body: {
        to: email,
        template: '2fa-setup-confirmation',
        variables: {
          fullName,
          settingsUrl: `${window.location.origin}/settings`,
        },
      },
    });

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Failed to send 2FA setup email:', error);
    return { error: error instanceof Error ? error : new Error('Failed to send email') };
  }
}

/**
 * Send custom email
 */
export async function sendCustomEmail(options: EmailOptions): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.functions.invoke('send-email', {
      body: {
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: options.replyTo,
      },
    });

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Failed to send custom email:', error);
    return { error: error instanceof Error ? error : new Error('Failed to send email') };
  }
}
