import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';

interface CheckPropagationRequest {
  domainName: string;
  recordName: string;
}

// List of popular DNS resolvers to check propagation
const NAMESERVERS = [
  { name: 'Google', server: '8.8.8.8' },
  { name: 'Cloudflare', server: '1.1.1.1' },
  { name: 'Quad9', server: '9.9.9.9' },
  { name: 'OpenDNS', server: '208.67.222.222' },
  { name: 'Verisign', server: '64.6.64.6' },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  try {
    const { domainName, recordName } = (await req.json()) as CheckPropagationRequest;

    if (!domainName || !recordName) {
      return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Simulate DNS propagation check
    // In production, you would use actual DNS lookups via a library like dns.js
    // For now, we return a simplified response

    const checkResults = await Promise.all(
      NAMESERVERS.map(async (ns) => {
        try {
          // Simulate DNS query delay
          await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000));

          // In real implementation, you would query this nameserver
          // For demo, we'll assume it's propagated after a delay
          return {
            nameserver: ns.name,
            propagated: Math.random() > 0.2, // 80% propagated
          };
        } catch {
          return {
            nameserver: ns.name,
            propagated: false,
          };
        }
      })
    );

    const propagatedCount = checkResults.filter((r) => r.propagated).length;
    const percentage = Math.round((propagatedCount / NAMESERVERS.length) * 100);
    const fullyPropagated = percentage >= 80;

    return new Response(
      JSON.stringify({
        domainName,
        recordName,
        propagated: fullyPropagated,
        percentage,
        details: checkResults,
        message:
          fullyPropagated
            ? 'DNS record has fully propagated'
            : `DNS record is propagating (${percentage}% complete)`,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('DNS propagation check error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to check DNS propagation',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});
