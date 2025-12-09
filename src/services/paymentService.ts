import { supabase } from '@/integrations/supabase/client';

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  plan_name: 'free' | 'starter' | 'business' | 'enterprise';
  status: 'active' | 'past_due' | 'canceled' | 'unpaid';
  current_period_start: Date;
  current_period_end: Date;
  cancel_at_period_end: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Invoice {
  id: string;
  user_id: string;
  stripe_invoice_id: string;
  amount: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  invoice_pdf: string | null;
  created_at: Date;
  due_date: Date | null;
  paid_at: Date | null;
}

export interface PaymentMethod {
  id: string;
  user_id: string;
  stripe_payment_method_id: string;
  type: string;
  card_brand: string;
  card_last_four: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
  created_at: Date;
}

/**
 * Get or create a Stripe checkout session for plan upgrade
 */
export async function createCheckoutSession(
  userId: string,
  planName: 'starter' | 'business' | 'enterprise'
): Promise<{ error: Error | null; data?: { sessionId: string; url: string } }> {
  try {
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: {
        userId,
        planName,
      },
    });

    if (error) throw error;
    return { error: null, data };
  } catch (error) {
    console.error('Failed to create checkout session:', error);
    return { error: error instanceof Error ? error : new Error('Checkout failed') };
  }
}

/**
 * Get user's current subscription
 */
export async function getSubscription(userId: string): Promise<{ error: Error | null; data?: Subscription }> {
  try {
    // Note: These tables are created via migration, so queries may fail before migration is applied
    const { data, error } = await (supabase
      .from('subscriptions' as any)
      .select('*')
      .eq('user_id', userId)
      .single() as any);

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows found (expected for free users)
      console.warn('Subscription query error (table may not exist yet):', error);
      return { error: null, data: undefined };
    }

    if (!data) {
      return { error: null, data: undefined };
    }

    return {
      error: null,
      data: {
        ...data,
        current_period_start: new Date(data.current_period_start),
        current_period_end: new Date(data.current_period_end),
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
      },
    };
  } catch (error) {
    console.warn('Failed to fetch subscription:', error);
    // Return no subscription rather than error
    return { error: null, data: undefined };
  }
}

/**
 * Get user's billing history
 */
export async function getInvoices(
  userId: string,
  limit: number = 10
): Promise<{ error: Error | null; data?: Invoice[] }> {
  try {
    const { data, error } = await (supabase
      .from('invoices' as any)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit) as any);

    if (error) {
      console.warn('Invoices query error (table may not exist yet):', error);
      return { error: null, data: [] };
    }

    const invoices = (data || []).map((invoice: any) => ({
      ...invoice,
      created_at: new Date(invoice.created_at),
      due_date: invoice.due_date ? new Date(invoice.due_date) : null,
      paid_at: invoice.paid_at ? new Date(invoice.paid_at) : null,
    }));

    return { error: null, data: invoices };
  } catch (error) {
    console.warn('Failed to fetch invoices:', error);
    return { error: null, data: [] };
  }
}

/**
 * Get user's payment methods
 */
export async function getPaymentMethods(userId: string): Promise<{ error: Error | null; data?: PaymentMethod[] }> {
  try {
    const { data, error } = await (supabase
      .from('payment_methods' as any)
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false }) as any);

    if (error) {
      console.warn('Payment methods query error (table may not exist yet):', error);
      return { error: null, data: [] };
    }

    const methods = (data || []).map((method: any) => ({
      ...method,
      created_at: new Date(method.created_at),
    }));

    return { error: null, data: methods };
  } catch (error) {
    console.warn('Failed to fetch payment methods:', error);
    return { error: null, data: [] };
  }
}

/**
 * Set default payment method
 */
export async function setDefaultPaymentMethod(
  userId: string,
  paymentMethodId: string
): Promise<{ error: Error | null }> {
  try {
    // First, unset all other default methods
    const { error: unsetError } = await (supabase
      .from('payment_methods' as any)
      .update({ is_default: false })
      .eq('user_id', userId) as any);

    if (unsetError) throw unsetError;

    // Then set the new default
    const { error } = await (supabase
      .from('payment_methods' as any)
      .update({ is_default: true })
      .eq('id', paymentMethodId)
      .eq('user_id', userId) as any);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Failed to set default payment method:', error);
    return { error: error instanceof Error ? error : new Error('Failed to update payment method') };
  }
}

/**
 * Delete payment method
 */
export async function deletePaymentMethod(paymentMethodId: string): Promise<{ error: Error | null }> {
  try {
    const { error } = await (supabase
      .from('payment_methods' as any)
      .delete()
      .eq('id', paymentMethodId) as any);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Failed to delete payment method:', error);
    return { error: error instanceof Error ? error : new Error('Failed to delete payment method') };
  }
}

/**
 * Cancel subscription at period end
 */
export async function cancelSubscription(userId: string): Promise<{ error: Error | null }> {
  try {
    const { data: subscription, error: fetchError } = await (supabase
      .from('subscriptions' as any)
      .select('stripe_subscription_id')
      .eq('user_id', userId)
      .single() as any);

    if (fetchError) throw fetchError;
    if (!subscription) throw new Error('No active subscription');

    const { error } = await supabase.functions.invoke('cancel-subscription', {
      body: {
        stripeSubscriptionId: subscription.stripe_subscription_id,
      },
    });

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Failed to cancel subscription:', error);
    return { error: error instanceof Error ? error : new Error('Failed to cancel subscription') };
  }
}

/**
 * Reactivate canceled subscription
 */
export async function reactivateSubscription(userId: string): Promise<{ error: Error | null }> {
  try {
    const { data: subscription, error: fetchError } = await (supabase
      .from('subscriptions' as any)
      .select('stripe_subscription_id')
      .eq('user_id', userId)
      .single() as any);

    if (fetchError) throw fetchError;
    if (!subscription) throw new Error('No subscription to reactivate');

    const { error } = await supabase.functions.invoke('reactivate-subscription', {
      body: {
        stripeSubscriptionId: subscription.stripe_subscription_id,
      },
    });

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Failed to reactivate subscription:', error);
    return { error: error instanceof Error ? error : new Error('Failed to reactivate subscription') };
  }
}

/**
 * Get billing portal session for customer portal access
 */
export async function createBillingPortalSession(userId: string): Promise<{ error: Error | null; data?: { url: string } }> {
  try {
    const { data, error } = await supabase.functions.invoke('create-billing-portal-session', {
      body: {
        userId,
      },
    });

    if (error) throw error;
    return { error: null, data };
  } catch (error) {
    console.error('Failed to create billing portal session:', error);
    return { error: error instanceof Error ? error : new Error('Failed to access billing portal') };
  }
}
