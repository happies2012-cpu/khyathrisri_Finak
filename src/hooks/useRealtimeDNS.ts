import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DNSRecord } from '@/types/data';

export function useRealtimeDNS(domainName: string | undefined) {
  const [records, setRecords] = useState<DNSRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!domainName) {
      setIsLoading(false);
      return;
    }

    const loadRecords = async () => {
      try {
        setIsLoading(true);
        const { data, error: err } = await (supabase as any)
          .from('dns_records')
          .select('*')
          .eq('domain_name', domainName)
          .order('created_at', { ascending: false });

        if (err) throw err;

        setRecords((data || []) as any as DNSRecord[]);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load DNS records');
        console.error('Error loading DNS records:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecords();

    // Subscribe to real-time DNS record updates
    const dnsSubscription = supabase
      .channel(`dns_records:domain_name=eq.${domainName}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dns_records' }, () => {
        loadRecords();
      })
      .subscribe();

    return () => {
      dnsSubscription.unsubscribe();
    };
  }, [domainName]);

  return { records, isLoading, error };
}
