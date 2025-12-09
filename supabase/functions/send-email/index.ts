import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.0';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

interface SendEmailRequest {
  to: string;
  template?: string;
  subject?: string;
  html?: string;
  text?: string;
  replyTo?: string;
  variables?: Record<string, any>;
}

// Email templates
const TEMPLATES: Record<string, { subject: string; html: (vars: any) => string }> = {
  'welcome': {
    subject: 'Welcome to KSFoundation',
    html: (vars) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h1 style="color: #333;">Welcome to KSFoundation, ${vars.fullName}!</h1>
        <p>We're excited to have you on board. Your account is ready to use.</p>
        <p>
          <a href="${vars.loginUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
            Log in to your account
          </a>
        </p>
        <p>If you have any questions, reply to this email or contact our support team.</p>
        <p>Best regards,<br/>The KSFoundation Team</p>
      </div>
    `,
  },
  'password-reset': {
    subject: 'Reset Your Password',
    html: (vars) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h1 style="color: #333;">Password Reset Request</h1>
        <p>We received a request to reset your password. Click the link below to proceed:</p>
        <p>
          <a href="${vars.resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px;">
            Reset Password
          </a>
        </p>
        <p style="color: #666; font-size: 12px;">This link expires in ${vars.expiresIn}.</p>
        <p>If you didn't request a password reset, please ignore this email.</p>
        <p>Best regards,<br/>The KSFoundation Team</p>
      </div>
    `,
  },
  'email-verification': {
    subject: 'Verify Your Email Address',
    html: (vars) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h1 style="color: #333;">Verify Your Email</h1>
        <p>Please verify your email address to complete your signup:</p>
        <p>
          <a href="${vars.verificationLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
            Verify Email
          </a>
        </p>
        <p style="color: #666; font-size: 12px;">This link expires in ${vars.expiresIn}.</p>
        <p>Best regards,<br/>The KSFoundation Team</p>
      </div>
    `,
  },
  'subscription-confirmation': {
    subject: 'Subscription Confirmed - Welcome to {{planName}}',
    html: (vars) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h1 style="color: #333;">Subscription Confirmed!</h1>
        <p>Hi ${vars.fullName},</p>
        <p>Thank you for upgrading to our <strong>${vars.planName}</strong> plan.</p>
        <p style="font-size: 18px;"><strong>Amount: ${vars.amount}/month</strong></p>
        <p>
          <a href="${vars.billingUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
            View Your Subscription
          </a>
        </p>
        <p>You now have access to all premium features. Enjoy!</p>
        <p>Best regards,<br/>The KSFoundation Team</p>
      </div>
    `,
  },
  'invoice': {
    subject: 'Invoice {{invoiceId}} - {{amount}}',
    html: (vars) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h1 style="color: #333;">Invoice {{invoiceId}}</h1>
        <p>Hi ${vars.fullName},</p>
        <p>Please find your invoice details below:</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px;">
          <p><strong>Invoice ID:</strong> ${vars.invoiceId}</p>
          <p><strong>Amount Due:</strong> ${vars.amount}</p>
          <p><strong>Due Date:</strong> ${vars.dueDate}</p>
        </div>
        <p>
          <a href="${vars.invoiceUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
            Download Invoice
          </a>
        </p>
        <p>Questions? Contact our support team.</p>
        <p>Best regards,<br/>The KSFoundation Team</p>
      </div>
    `,
  },
  'payment-failed': {
    subject: 'Payment Failed - Action Required',
    html: (vars) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h1 style="color: #d32f2f;">Payment Failed</h1>
        <p>Hi ${vars.fullName},</p>
        <p>We were unable to process a payment of <strong>${vars.amount}</strong>.</p>
        <p><strong>Reason:</strong> ${vars.reason}</p>
        <p>Please update your payment method to avoid service interruption.</p>
        <p>
          <a href="${vars.actionUrl}" style="display: inline-block; padding: 10px 20px; background-color: #d32f2f; color: white; text-decoration: none; border-radius: 5px;">
            Update Payment Method
          </a>
        </p>
        <p>Best regards,<br/>The KSFoundation Team</p>
      </div>
    `,
  },
  'ticket-confirmation': {
    subject: 'Support Ticket Created - {{ticketId}}',
    html: (vars) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h1 style="color: #333;">Ticket Confirmed</h1>
        <p>Hi ${vars.fullName},</p>
        <p>Your support ticket has been received!</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px;">
          <p><strong>Ticket ID:</strong> ${vars.ticketId}</p>
          <p><strong>Subject:</strong> ${vars.subject}</p>
        </div>
        <p>
          <a href="${vars.trackingUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
            Track Your Ticket
          </a>
        </p>
        <p>We'll respond as soon as possible.</p>
        <p>Best regards,<br/>The KSFoundation Support Team</p>
      </div>
    `,
  },
  'ticket-reply': {
    subject: 'New Reply on Ticket {{ticketId}}',
    html: (vars) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h1 style="color: #333;">Ticket Update</h1>
        <p>Hi ${vars.fullName},</p>
        <p>There's a new reply on your support ticket!</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; border-left: 4px solid #007bff;">
          <p><strong>Preview:</strong></p>
          <p>${vars.replyPreview}</p>
        </div>
        <p>
          <a href="${vars.viewUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
            View Full Response
          </a>
        </p>
        <p>Best regards,<br/>The KSFoundation Support Team</p>
      </div>
    `,
  },
  'two-factor-code': {
    subject: 'Your Two-Factor Authentication Code',
    html: (vars) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h1 style="color: #333;">Two-Factor Authentication</h1>
        <p>Your authentication code is:</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; text-align: center;">
          <p style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #007bff;">${vars.code}</p>
        </div>
        <p style="color: #666; font-size: 12px;">This code expires in ${vars.expiresIn}.</p>
        <p>Never share this code with anyone.</p>
        <p>Best regards,<br/>The KSFoundation Team</p>
      </div>
    `,
  },
  'cancellation-notice': {
    subject: 'Subscription Cancellation Notice',
    html: (vars) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h1 style="color: #333;">Subscription Cancellation</h1>
        <p>Hi ${vars.fullName},</p>
        <p>Your subscription is scheduled to be canceled on <strong>${vars.cancelDate}</strong>.</p>
        <p>You'll have access until the end of your billing period. If you change your mind, you can reactivate your subscription anytime.</p>
        <p>
          <a href="${vars.reactivateUrl}" style="display: inline-block; padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px;">
            Reactivate Subscription
          </a>
        </p>
        <p>We'd love to have you back!</p>
        <p>Best regards,<br/>The KSFoundation Team</p>
      </div>
    `,
  },
  '2fa-setup-confirmation': {
    subject: 'Two-Factor Authentication Enabled',
    html: (vars) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h1 style="color: #333;">Security Enabled</h1>
        <p>Hi ${vars.fullName},</p>
        <p>Two-factor authentication has been successfully enabled on your account.</p>
        <p>Your account is now more secure. You'll need to provide a code from your authenticator app when logging in.</p>
        <p>
          <a href="${vars.settingsUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
            Manage Security Settings
          </a>
        </p>
        <p>Best regards,<br/>The KSFoundation Team</p>
      </div>
    `,
  },
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  try {
    const { to, template, subject, html, text, replyTo, variables = {} } = (await req.json()) as SendEmailRequest;

    if (!to) {
      return new Response(JSON.stringify({ error: 'Missing recipient email' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get template or use provided HTML
    let emailSubject = subject || '';
    let emailHtml = html || '';

    if (template && TEMPLATES[template]) {
      const tpl = TEMPLATES[template];
      emailSubject = tpl.subject;
      emailHtml = tpl.html(variables);
      
      // Replace template variables in subject
      Object.entries(variables).forEach(([key, value]) => {
        emailSubject = emailSubject.replace(`{{${key}}}`, String(value));
      });
    }

    // Send email via Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      },
      body: JSON.stringify({
        from: 'KSFoundation <noreply@ksfoundation.com>',
        to: to,
        subject: emailSubject,
        html: emailHtml,
        text: text,
        reply_to: replyTo || 'support@ksfoundation.com',
      }),
    });

    if (!resendResponse.ok) {
      const error = await resendResponse.json();
      throw new Error(`Resend API error: ${error.message || 'Unknown error'}`);
    }

    const result = await resendResponse.json();

    // Log email in database
    await supabase.from('email_logs').insert({
      recipient_email: to,
      template_name: template || 'custom',
      subject: emailSubject,
      status: 'sent',
      sent_at: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({
        success: true,
        messageId: result.id,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Email sending error:', error);

    // Log failed email
    try {
      const body = await req.json() as SendEmailRequest;
      await supabase.from('email_logs').insert({
        recipient_email: body.to || 'unknown',
        template_name: body.template || 'custom',
        subject: body.subject || 'Unknown',
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
      });
    } catch (logError) {
      console.error('Failed to log email error:', logError);
    }

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to send email',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});
