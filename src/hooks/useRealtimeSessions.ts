import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SessionInfo } from '@/types/data';

export function useRealtimeSessions(userId: string | undefined) {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const loadSessions = async () => {
      try {
        setIsLoading(true);
        const { data, error: err } = await (supabase as any)
          .from('user_sessions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (err) throw err;

        setSessions((data || []) as any as SessionInfo[]);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load sessions');
        console.error('Error loading sessions:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSessions();

    // Subscribe to real-time session updates
    const sessionsSubscription = supabase
      .channel(`user_sessions:user_id=eq.${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_sessions' }, () => {
        loadSessions();
      })
      .subscribe();

    return () => {
      sessionsSubscription.unsubscribe();
    };
  }, [userId]);

  return { sessions, isLoading, error };
}
