import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import {
  Activity as ActivityIcon,
  Server,
  Globe,
  User,
  Settings,
  CreditCard,
  Shield,
  Clock,
} from 'lucide-react';

interface ActivityItem {
  id: string;
  action: string;
  details: any;
  created_at: string;
}

const actionIcons: Record<string, any> = {
  'hosting.created': Server,
  'hosting.updated': Server,
  'hosting.deleted': Server,
  'domain.registered': Globe,
  'domain.renewed': Globe,
  'profile.updated': User,
  'settings.updated': Settings,
  'billing.payment': CreditCard,
  'security.login': Shield,
  default: ActivityIcon,
};

const actionColors: Record<string, string> = {
  'hosting.created': 'text-success',
  'hosting.deleted': 'text-destructive',
  'billing.payment': 'text-primary',
  'security.login': 'text-secondary',
  default: 'text-muted-foreground',
};

export default function Activity() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();

    const channel = supabase
      .channel('activity-log')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'activity_log' },
        (payload) => {
          setActivities((prev) => [payload.new as ActivityItem, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchActivities = async () => {
    const { data, error } = await supabase
      .from('activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      setActivities(data);
    }
    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'hosting.created': 'Created hosting account',
      'hosting.updated': 'Updated hosting account',
      'hosting.deleted': 'Deleted hosting account',
      'domain.registered': 'Registered domain',
      'domain.renewed': 'Renewed domain',
      'profile.updated': 'Updated profile',
      'settings.updated': 'Changed settings',
      'billing.payment': 'Made payment',
      'security.login': 'Logged in',
    };
    return labels[action] || action;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Activity</h1>
          <p className="text-muted-foreground mt-1">Track all actions on your account</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ActivityIcon className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Real-time updates on your account</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold">No activity yet</h3>
                <p className="text-muted-foreground">
                  Your recent actions will appear here
                </p>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />
                <div className="space-y-6">
                  {activities.map((activity) => {
                    const Icon = actionIcons[activity.action] || actionIcons.default;
                    const color = actionColors[activity.action] || actionColors.default;

                    return (
                      <div key={activity.id} className="flex gap-4 relative">
                        <div className={`p-2 rounded-full bg-muted z-10 ${color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 pt-1">
                          <p className="font-medium">{getActionLabel(activity.action)}</p>
                          {activity.details && (
                            <p className="text-sm text-muted-foreground">
                              {typeof activity.details === 'object'
                                ? JSON.stringify(activity.details)
                                : activity.details}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(activity.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
