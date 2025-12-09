import Stripe from 'https://esm.sh/stripe@14.0.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-04-10',
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return new Response(JSON.stringify({ error: 'Missing signature' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.text();
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET') || '',
      undefined,
      Stripe.createFetchHttpClient()
    );

    // Store the event for processing
    const { error: insertError } = await supabase.from('billing_events').insert({
      event_type: event.type,
      stripe_event_id: event.id,
      data: event.data,
      processed: false,
    });

    if (insertError) throw insertError;

    // Handle specific event types
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case 'payment_method.attached':
        await handlePaymentMethodAttached(event.data.object as Stripe.PaymentMethod);
        break;

      case 'payment_method.detached':
        await handlePaymentMethodDetached(event.data.object as Stripe.PaymentMethod);
        break;
    }

    // Mark event as processed
    const { error: updateError } = await supabase
      .from('billing_events')
      .update({ processed: true })
      .eq('stripe_event_id', event.id);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Webhook processing failed',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  if (!userId) return;

  const planName = subscription.metadata?.planName || 'starter';

  const { error } = await supabase.from('subscriptions').upsert(
    {
      user_id: userId,
      stripe_customer_id: subscription.customer as string,
      stripe_subscription_id: subscription.id,
      plan_name: planName,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000),
      cancel_at_period_end: subscription.cancel_at_period_end,
    },
    { onConflict: 'user_id' }
  );

  if (error) throw error;

  // Update user profile subscription plan
  await supabase
    .from('profiles')
    .update({ subscription_plan: planName })
    .eq('id', userId);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  if (!userId) return;

  const { error } = await supabase
    .from('subscriptions')
    .update({ status: 'canceled' })
    .eq('stripe_subscription_id', subscription.id);

  if (error) throw error;

  // Reset user to free plan
  await supabase.from('profiles').update({ subscription_plan: 'free' }).eq('id', userId);
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const userId = invoice.metadata?.userId;
  if (!userId) return;

  const { error } = await supabase.from('invoices').upsert(
    {
      user_id: userId,
      stripe_invoice_id: invoice.id,
      amount: invoice.total || 0,
      currency: invoice.currency || 'usd',
      status: 'paid',
      invoice_pdf: invoice.pdf,
      paid_at: new Date(invoice.paid_at ? invoice.paid_at * 1000 : Date.now()),
      due_date: invoice.due_date ? new Date(invoice.due_date * 1000) : null,
    },
    { onConflict: 'stripe_invoice_id' }
  );

  if (error) throw error;
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const userId = invoice.metadata?.userId;
  if (!userId) return;

  const { error } = await supabase.from('invoices').upsert(
    {
      user_id: userId,
      stripe_invoice_id: invoice.id,
      amount: invoice.total || 0,
      currency: invoice.currency || 'usd',
      status: 'open',
      invoice_pdf: invoice.pdf,
      due_date: invoice.due_date ? new Date(invoice.due_date * 1000) : null,
    },
    { onConflict: 'stripe_invoice_id' }
  );

  if (error) throw error;
}

async function handlePaymentMethodAttached(paymentMethod: Stripe.PaymentMethod) {
  if (!paymentMethod.customer) return;

  const { data: subscription, error: subError } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', paymentMethod.customer as string)
    .single();

  if (subError || !subscription) return;

  const card = paymentMethod.card;
  const { error } = await supabase.from('payment_methods').insert({
    user_id: subscription.user_id,
    stripe_payment_method_id: paymentMethod.id,
    type: paymentMethod.type,
    card_brand: card?.brand,
    card_last_four: card?.last4,
    exp_month: card?.exp_month,
    exp_year: card?.exp_year,
    is_default: false,
  });

  if (error) throw error;
}

async function handlePaymentMethodDetached(paymentMethod: Stripe.PaymentMethod) {
  const { error } = await supabase
    .from('payment_methods')
    .delete()
    .eq('stripe_payment_method_id', paymentMethod.id);

  if (error) throw error;
}
