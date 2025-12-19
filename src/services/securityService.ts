import { supabase } from '@/integrations/supabase/client';

export interface LoginAttempt {
  id: string;
  user_id?: string;
  email: string;
  ip_address: string;
  user_agent: string;
  success: boolean;
  attempted_at: string;
  location?: string;
  device_type?: string;
}

export interface SecurityEvent {
  id: string;
  user_id: string;
  type: 'suspicious_login' | 'password_change' | 'api_key_created' | 'ip_blocked';
  details: any;
  ip_address: string;
  created_at: string;
  resolved: boolean;
}

// IP Whitelisting
export async function getIpWhitelist(userId: string): Promise<string[]> {
  // Mock data - in production, fetch from user security settings
  return ['192.168.1.0/24', '10.0.0.0/8'];
}

export async function addToIpWhitelist(userId: string, ipRange: string): Promise<void> {
  // In production, validate IP range and add to whitelist
  console.log(`Adding ${ipRange} to whitelist for user ${userId}`);
}

export async function removeFromIpWhitelist(userId: string, ipRange: string): Promise<void> {
  // In production, remove from whitelist
  console.log(`Removing ${ipRange} from whitelist for user ${userId}`);
}

export function isIpAllowed(ip: string, whitelist: string[]): boolean {
  // Simple IP range checking - in production, use proper CIDR validation
  for (const range of whitelist) {
    if (range.includes(ip.split('.')[0] + '.' + ip.split('.')[1])) {
      return true;
    }
  }
  return false;
}

// Login Activity Monitoring
export async function getLoginHistory(userId: string, limit = 20): Promise<LoginAttempt[]> {
  // Mock data - in production, fetch from login_attempts table
  return [
    {
      id: 'login-1',
      user_id: userId,
      email: 'user@example.com',
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      success: true,
      attempted_at: '2025-01-18T10:30:00Z',
      location: 'New York, US',
      device_type: 'desktop'
    },
    {
      id: 'login-2',
      user_id: userId,
      email: 'user@example.com',
      ip_address: '10.0.0.50',
      user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
      success: true,
      attempted_at: '2025-01-17T15:45:00Z',
      location: 'New York, US',
      device_type: 'mobile'
    },
    {
      id: 'login-3',
      email: 'user@example.com',
      ip_address: '203.0.113.1',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      success: false,
      attempted_at: '2025-01-16T08:20:00Z',
      location: 'Unknown',
      device_type: 'desktop'
    }
  ];
}

export async function logLoginAttempt(email: string, ip: string, userAgent: string, success: boolean, userId?: string): Promise<void> {
  // In production, insert into login_attempts table
  console.log(`Login attempt: ${email} from ${ip}, success: ${success}`);

  // Check for suspicious activity
  if (!success) {
    await checkForSuspiciousActivity(email, ip);
  }
}

async function checkForSuspiciousActivity(email: string, ip: string): Promise<void> {
  // In production, check for patterns like:
  // - Multiple failed attempts from same IP
  // - Login from unusual location
  // - Brute force attempts

  const recentAttempts = await getRecentFailedAttempts(email, ip);
  if (recentAttempts.length > 5) {
    await createSecurityAlert(email, 'brute_force_attempt', { ip, attempts: recentAttempts.length });
  }
}

async function getRecentFailedAttempts(email: string, ip: string): Promise<LoginAttempt[]> {
  // Mock data - in production, query database
  return [];
}

async function createSecurityAlert(userEmail: string, type: string, details: any): Promise<void> {
  // In production, create security alert and send notification
  console.log(`Security alert: ${type} for ${userEmail}`, details);
}

// Suspicious Activity Alerts
export async function getSecurityAlerts(userId: string): Promise<SecurityEvent[]> {
  // Mock data - in production, fetch from security_events table
  return [
    {
      id: 'alert-1',
      user_id: userId,
      type: 'suspicious_login',
      details: { ip: '203.0.113.1', location: 'Unknown' },
      ip_address: '203.0.113.1',
      created_at: '2025-01-16T08:20:00Z',
      resolved: false
    }
  ];
}

export async function resolveSecurityAlert(alertId: string): Promise<void> {
  // In production, mark alert as resolved
  console.log(`Resolving security alert ${alertId}`);
}

// Password Security Requirements
export interface PasswordRequirements {
  min_length: number;
  require_uppercase: boolean;
  require_lowercase: boolean;
  require_numbers: boolean;
  require_special_chars: boolean;
}

export function validatePassword(password: string, requirements: PasswordRequirements): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < requirements.min_length) {
    errors.push(`Password must be at least ${requirements.min_length} characters long`);
  }

  if (requirements.require_uppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (requirements.require_lowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (requirements.require_numbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (requirements.require_special_chars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Session Management
export async function getActiveSessions(userId: string): Promise<any[]> {
  // Mock data - in production, fetch from user_sessions table
  return [
    {
      id: 'session-1',
      device: 'Chrome on Windows',
      ip: '192.168.1.100',
      location: 'New York, US',
      last_active: '2025-01-18T10:30:00Z',
      current: true
    },
    {
      id: 'session-2',
      device: 'Safari on iPhone',
      ip: '192.168.1.100',
      location: 'New York, US',
      last_active: '2025-01-17T15:45:00Z',
      current: false
    }
  ];
}

export async function revokeSession(sessionId: string): Promise<void> {
  // In production, invalidate session
  console.log(`Revoking session ${sessionId}`);
}

export async function revokeAllSessions(userId: string, exceptCurrent = true): Promise<void> {
  // In production, revoke all sessions except current
  console.log(`Revoking all sessions for user ${userId}, except current: ${exceptCurrent}`);
}

// Location-based restrictions
export async function getLocationRestrictions(userId: string): Promise<string[]> {
  // Mock data - allowed countries
  return ['US', 'CA', 'GB'];
}

export async function updateLocationRestrictions(userId: string, countries: string[]): Promise<void> {
  // In production, update allowed countries
  console.log(`Updating location restrictions for user ${userId}:`, countries);
}

export function getLocationFromIp(ip: string): string {
  // Mock geolocation - in production, use IP geolocation service
  if (ip.startsWith('192.168') || ip.startsWith('10.')) {
    return 'New York, US';
  }
  return 'Unknown';
}

export function getDeviceType(userAgent: string): string {
  if (userAgent.includes('Mobile') || userAgent.includes('iPhone') || userAgent.includes('Android')) {
    return 'mobile';
  }
  if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
    return 'tablet';
  }
  return 'desktop';
}</content>
