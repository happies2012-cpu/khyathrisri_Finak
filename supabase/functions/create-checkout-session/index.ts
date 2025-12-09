import Stripe from 'https://esm.sh/stripe@14.0.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-04-10',
});

interface CheckoutSessionRequest {
  userId: string;
  planName: 'starter' | 'business' | 'enterprise';
}

const PLAN_PRICES: Record<string, { priceId: string; name: string }> = {
  starter: {
    priceId: Deno.env.get('STRIPE_PRICE_STARTER') || '',
    name: 'Starter',
  },
  business: {
    priceId: Deno.env.get('STRIPE_PRICE_BUSINESS') || '',
    name: 'Business',
  },
  enterprise: {
    priceId: Deno.env.get('STRIPE_PRICE_ENTERPRISE') || '',
    name: 'Enterprise',
  },
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  try {
    const { userId, planName } = (await req.json()) as CheckoutSessionRequest;

    if (!userId || !planName) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const plan = PLAN_PRICES[planName];
    if (!plan || !plan.priceId) {
      return new Response(JSON.stringify({ error: 'Invalid plan' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: '', // This would be populated with user email from Supabase
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${Deno.env.get('PUBLIC_URL')}/billing?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${Deno.env.get('PUBLIC_URL')}/billing`,
      metadata: {
        userId,
        planName,
      },
    });

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Checkout session error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});
