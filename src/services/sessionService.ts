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

    const { error } = await (supabase as any).from('user_sessions').insert({
      user_id: userId,
      ip_address: ipAddress || 'unknown',
      user_agent: userAgent,
      device_type: deviceType,
      browser: `${browser}`,
      os: `${os}`,
      last_activity: new Date().toISOString(),
    });

    if (error) throw error;
  } catch (error) {
    // Silent fail - session tracking shouldn't block login
  }
}

/**
 * List user sessions
 */
export async function listUserSessions(userId: string): Promise<SessionInfo[]> {
  try {
    const { data: sessions, error } = await (supabase as any)
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('last_activity', { ascending: false });

    if (error) throw error;

    const currentUserAgent = navigator.userAgent;

    return (sessions || []).map((session: any) => ({
      id: session.id,
      user_id: session.user_id,
      ip_address: session.ip_address || 'unknown',
      device_type: session.device_type || 'unknown',
      browser: session.browser || 'Unknown',
      os: session.os || 'Unknown',
      last_activity: new Date(session.last_activity),
      created_at: new Date(session.created_at),
      is_active: session.is_active !== false,
      user_agent: session.user_agent,
    })) as SessionInfo[];
  } catch (error) {
    return [];
  }
}

/**
 * Revoke (delete) a session
 */
export async function revokeSession(sessionId: string) {
  try {
    const { error } = await (supabase as any).from('user_sessions').delete().eq('id', sessionId);

    if (error) throw error;
  } catch (error) {
    throw new Error('Failed to revoke session');
  }
}

/**
 * Update last activity timestamp for current session
 */
export async function updateSessionActivity(userId: string) {
  try {
    const userAgent = navigator.userAgent;

    await (supabase as any)
      .from('user_sessions')
      .update({ last_activity: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('user_agent', userAgent);
  } catch (error) {
    // Silent fail - activity tracking shouldn't cause errors
  }
}

/**
 * Clean up old inactive sessions (older than 30 days)
 */
export async function cleanupOldSessions(userId: string, daysOld: number = 30) {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - daysOld);

    await (supabase as any)
      .from('user_sessions')
      .delete()
      .eq('user_id', userId)
      .lt('last_activity', thirtyDaysAgo.toISOString());
  } catch (error) {
    // Silent fail - cleanup shouldn't block app
  }
}
