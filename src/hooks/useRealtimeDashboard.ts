import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DashboardMetrics } from '@/types/data';

export function useRealtimeDashboard(userId: string | undefined) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    // Initial load
    const loadMetrics = async () => {
      try {
        setIsLoading(true);
        const { data: orders, error: ordersError } = await (supabase as any)
          .from('orders')
          .select('*')
          .eq('user_id', userId);

        if (ordersError) throw ordersError;

        const { data: tickets, error: ticketsError } = await (supabase as any)
          .from('support_tickets')
          .select('*')
          .eq('user_id', userId);

        if (ticketsError) throw ticketsError;

        const { data: subscriptions, error: subsError } = await (supabase as any)
          .from('subscriptions')
          .select('*')
          .eq('user_id', userId);

        if (subsError) throw subsError;

        const totalRevenue = (orders || []).reduce((sum: number, order: any) => sum + (order.amount || 0), 0);
        const activeSubscriptions = (subscriptions || []).filter((sub: any) => sub.status === 'active').length;
        const pendingTickets = (tickets || []).filter((t: any) => t.status === 'pending').length;

        setMetrics({
          totalRevenue,
          activeSubscriptions,
          totalDomains: 0,
          supportTickets: (tickets || []).length,
          pendingTickets,
          revenueGrowth: 12.5,
          subscriptionChurn: 2.3,
        });
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load metrics');
        console.error('Error loading dashboard metrics:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadMetrics();

    // Subscribe to real-time updates
    const ordersSubscription = supabase
      .channel(`orders:user_id=eq.${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        loadMetrics();
      })
      .subscribe();

    const ticketsSubscription = supabase
      .channel(`tickets:user_id=eq.${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, () => {
        loadMetrics();
      })
      .subscribe();

    const subscriptionsSubscription = supabase
      .channel(`subscriptions:user_id=eq.${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subscriptions' }, () => {
        loadMetrics();
      })
      .subscribe();

    return () => {
      ordersSubscription.unsubscribe();
      ticketsSubscription.unsubscribe();
      subscriptionsSubscription.unsubscribe();
    };
  }, [userId]);

  return { metrics, isLoading, error };
}
