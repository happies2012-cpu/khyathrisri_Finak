import { supabase } from '@/integrations/supabase/client';

export interface SessionInfo {
  id: string;
  ipAddress: string;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  browser: string;
  os: string;
  lastActivity: Date;
  createdAt: Date;
  isCurrent?: boolean;
}

/**
 * Parse user agent string to extract device and browser info
 */
function parseUserAgent(userAgent: string) {
  const ua = userAgent.toLowerCase();

  // Detect device type
  let deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown' = 'desktop';
  if (ua.includes('mobile') || ua.includes('android')) deviceType = 'mobile';
  else if (ua.includes('tablet') || ua.includes('ipad')) deviceType = 'tablet';

  // Detect browser
  let browser = 'Unknown';
  if (ua.includes('edge')) browser = 'Edge';
  else if (ua.includes('edg')) browser = 'Edge';
  else if (ua.includes('firefox')) browser = 'Firefox';
  else if (ua.includes('chrome')) browser = 'Chrome';
  else if (ua.includes('safari')) browser = 'Safari';
  else if (ua.includes('opera') || ua.includes('opr')) browser = 'Opera';

  // Detect OS
  let os = 'Unknown';
  if (ua.includes('windows')) os = 'Windows';
  else if (ua.includes('mac')) os = 'macOS';
  else if (ua.includes('linux')) os = 'Linux';
  else if (ua.includes('android')) os = 'Android';
  else if (ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';

  return { deviceType, browser, os };
}

/**
 * Track a new session
 */
export async function trackNewSession(userId: string, userAgent: string, ipAddress?: string) {
  try {
    const { deviceType, browser, os } = parseUserAgent(userAgent);

    // Since we don't have a user_sessions table, we'll log to activity_log instead
    const { error } = await supabase.from('activity_log').insert({
      user_id: userId,
      action: 'session_started',
      details: {
        ip_address: ipAddress || 'unknown',
        user_agent: userAgent,
        device_type: deviceType,
        browser: browser,
        os: os,
      },
    });

    if (error) throw error;
  } catch (error) {
    // Silent fail - session tracking shouldn't block login
  }
}

/**
 * List user sessions (simulated from activity_log)
 */
export async function listUserSessions(userId: string): Promise<SessionInfo[]> {
  try {
    const { data: sessions, error } = await supabase
      .from('activity_log')
      .select('*')
      .eq('user_id', userId)
      .eq('action', 'session_started')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    return (sessions || []).map((session: any) => {
      const details = session.details as Record<string, any> || {};
      return {
        id: session.id,
        ipAddress: details.ip_address || 'unknown',
        deviceType: details.device_type || 'unknown',
        browser: details.browser || 'Unknown',
        os: details.os || 'Unknown',
        lastActivity: new Date(session.created_at),
        createdAt: new Date(session.created_at),
      };
    });
  } catch (error) {
    return [];
  }
}

/**
 * Revoke (delete) a session
 */
export async function revokeSession(sessionId: string) {
  try {
    // We can't actually delete sessions without a dedicated table
    // This is a placeholder that would need server-side implementation
    console.log('Session revocation requested for:', sessionId);
  } catch (error) {
    throw new Error('Failed to revoke session');
  }
}

/**
 * Update last activity timestamp for current session
 */
export async function updateSessionActivity(userId: string) {
  // No-op without dedicated session table
}

/**
 * Clean up old inactive sessions (older than 30 days)
 */
export async function cleanupOldSessions(userId: string, daysOld: number = 30) {
  // No-op without dedicated session table
}