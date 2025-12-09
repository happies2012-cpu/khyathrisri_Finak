import Stripe from 'https://esm.sh/stripe@14.0.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-04-10',
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

interface CancelSubscriptionRequest {
  stripeSubscriptionId: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  try {
    const { stripeSubscriptionId } = (await req.json()) as CancelSubscriptionRequest;

    if (!stripeSubscriptionId) {
      return new Response(JSON.stringify({ error: 'Missing subscription ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Cancel subscription at period end
    const subscription = await stripe.subscriptions.update(stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    // Update the database
    const { error } = await supabase
      .from('subscriptions')
      .update({ cancel_at_period_end: true })
      .eq('stripe_subscription_id', stripeSubscriptionId);

    if (error) throw error;

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Subscription will be canceled at period end',
        endDate: new Date(subscription.current_period_end * 1000),
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Cancel subscription error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to cancel subscription',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});
