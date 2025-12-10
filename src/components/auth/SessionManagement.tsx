import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Monitor, Smartphone, Tablet, LogOut, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { revokeSession, listUserSessions, SessionInfo } from '@/services/sessionService';

export default function SessionManagement() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<(SessionInfo & { current?: boolean })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSessions() {
      if (!user?.id) return;
      
      setIsLoading(true);
      try {
        const sessionsList = await listUserSessions(user.id);
        const sessionWithCurrent = sessionsList.map((session, index) => ({
          ...session,
          current: index === 0
        }));
        setSessions(sessionWithCurrent);
      } catch (err) {
        setError('Failed to load sessions');
      } finally {
        setIsLoading(false);
      }
    }

    fetchSessions();
  }, [user?.id]);

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await revokeSession(sessionId);
      setSessions(sessions.filter(s => s.id !== sessionId));
      toast.success('Session revoked successfully');
    } catch (error) {
      toast.error('Failed to revoke session');
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    const type = deviceType.toLowerCase();
    if (type === 'mobile') return <Smartphone className="h-4 w-4" />;
    if (type === 'tablet') return <Tablet className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Active Sessions
        </CardTitle>
        <CardDescription>
          Manage your active sessions across different devices and browsers.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">
            {error}
          </div>
        )}

        {sessions.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No active sessions found.
          </p>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                {getDeviceIcon(session.deviceType)}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {session.browser} on {session.os}
                    </span>
                    {session.current && (
                      <Badge variant="secondary">Current Session</Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {session.ipAddress} • {format(session.createdAt, 'MMM d, yyyy h:mm a')}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Last activity: {format(session.lastActivity, 'MMM d, yyyy h:mm a')}
                  </div>
                </div>
              </div>

              {!session.current && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRevokeSession(session.id)}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Revoke
                </Button>
              )}
            </div>
          ))
        )}

        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Revoking a session will sign out that device. You can revoke all other sessions to sign out everywhere except this device.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}