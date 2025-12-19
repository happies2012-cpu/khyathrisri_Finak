import { supabase } from '@/integrations/supabase/client';

export interface TeamMember {
  id: string;
  user_id: string;
  hosting_account_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
  invited_by?: string;
  email: string;
  full_name?: string;
}

export interface Invitation {
  id: string;
  email: string;
  hosting_account_id: string;
  invited_by: string;
  role: 'admin' | 'member';
  status: 'pending' | 'accepted' | 'expired';
  expires_at: string;
  token: string;
}

export interface ApiKey {
  id: string;
  user_id: string;
  name: string;
  key_hash: string;
  permissions: string[];
  last_used_at?: string;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
}

// Team Management
export async function getTeamMembers(accountId: string): Promise<TeamMember[]> {
  // Mock data - in production, fetch from hosting_account_members table
  return [
    {
      id: '1',
      user_id: 'user-123',
      hosting_account_id: accountId,
      role: 'owner',
      joined_at: '2025-01-01T00:00:00Z',
      email: 'owner@example.com',
      full_name: 'John Owner'
    },
    {
      id: '2',
      user_id: 'user-456',
      hosting_account_id: accountId,
      role: 'admin',
      joined_at: '2025-01-15T00:00:00Z',
      invited_by: 'user-123',
      email: 'admin@example.com',
      full_name: 'Jane Admin'
    }
  ];
}

export async function inviteTeamMember(accountId: string, email: string, role: 'admin' | 'member'): Promise<void> {
  // In production, create invitation record and send email
  console.log(`Inviting ${email} to account ${accountId} as ${role}`);
}

export async function removeTeamMember(accountId: string, memberId: string): Promise<void> {
  // In production, remove from hosting_account_members table
  console.log(`Removing member ${memberId} from account ${accountId}`);
}

export async function updateMemberRole(accountId: string, memberId: string, role: 'owner' | 'admin' | 'member'): Promise<void> {
  // In production, update role in hosting_account_members table
  console.log(`Updating member ${memberId} role to ${role} in account ${accountId}`);
}

// Invitations
export async function getPendingInvitations(accountId: string): Promise<Invitation[]> {
  // Mock data - in production, fetch from invitations table
  return [
    {
      id: 'inv-1',
      email: 'newmember@example.com',
      hosting_account_id: accountId,
      invited_by: 'user-123',
      role: 'member',
      status: 'pending',
      expires_at: '2025-02-01T00:00:00Z',
      token: 'abc123'
    }
  ];
}

export async function cancelInvitation(invitationId: string): Promise<void> {
  // In production, update invitation status
  console.log(`Cancelling invitation ${invitationId}`);
}

export async function resendInvitation(invitationId: string): Promise<void> {
  // In production, send new invitation email
  console.log(`Resending invitation ${invitationId}`);
}

// API Keys
export async function getApiKeys(userId: string): Promise<ApiKey[]> {
  // Mock data - in production, fetch from api_keys table
  return [
    {
      id: 'key-1',
      user_id: userId,
      name: 'Production API',
      key_hash: 'hashed_key_here',
      permissions: ['read', 'write'],
      last_used_at: '2025-01-18T10:30:00Z',
      expires_at: '2026-01-18T00:00:00Z',
      is_active: true,
      created_at: '2025-01-01T00:00:00Z'
    },
    {
      id: 'key-2',
      user_id: userId,
      name: 'Development API',
      key_hash: 'hashed_key_here_2',
      permissions: ['read'],
      last_used_at: '2025-01-17T15:45:00Z',
      expires_at: '2025-07-17T00:00:00Z',
      is_active: true,
      created_at: '2025-01-10T00:00:00Z'
    }
  ];
}

export async function createApiKey(userId: string, name: string, permissions: string[], expiresAt?: string): Promise<string> {
  // In production, generate secure API key, hash it, and store
  const apiKey = `ks_${Math.random().toString(36).substring(2, 15)}`;
  console.log(`Created API key ${name} for user ${userId}: ${apiKey}`);
  return apiKey;
}

export async function revokeApiKey(keyId: string): Promise<void> {
  // In production, deactivate API key
  console.log(`Revoking API key ${keyId}`);
}

export async function updateApiKeyPermissions(keyId: string, permissions: string[]): Promise<void> {
  // In production, update permissions
  console.log(`Updating permissions for API key ${keyId}:`, permissions);
}

// Security Features
export interface SecuritySettings {
  two_factor_enabled: boolean;
  login_notifications: boolean;
  ip_whitelist: string[];
  session_timeout: number;
  password_requirements: {
    min_length: number;
    require_special_chars: boolean;
    require_numbers: boolean;
  };
}

export async function getSecuritySettings(userId: string): Promise<SecuritySettings> {
  // Mock data - in production, fetch from user preferences
  return {
    two_factor_enabled: true,
    login_notifications: true,
    ip_whitelist: ['192.168.1.0/24'],
    session_timeout: 30, // minutes
    password_requirements: {
      min_length: 8,
      require_special_chars: true,
      require_numbers: true
    }
  };
}

export async function updateSecuritySettings(userId: string, settings: Partial<SecuritySettings>): Promise<void> {
  // In production, update user security preferences
  console.log(`Updating security settings for user ${userId}:`, settings);
}

export async function addToIpWhitelist(userId: string, ipRange: string): Promise<void> {
  // In production, add IP to whitelist
  console.log(`Adding ${ipRange} to IP whitelist for user ${userId}`);
}

export async function removeFromIpWhitelist(userId: string, ipRange: string): Promise<void> {
  // In production, remove IP from whitelist
  console.log(`Removing ${ipRange} from IP whitelist for user ${userId}`);
}

// Audit Logs
export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export async function getAuditLogs(userId: string, limit = 50): Promise<AuditLog[]> {
  // Mock data - in production, fetch from audit_logs table
  return [
    {
      id: 'log-1',
      user_id: userId,
      action: 'login',
      resource_type: 'auth',
      details: { method: 'password' },
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0...',
      created_at: '2025-01-18T10:30:00Z'
    },
    {
      id: 'log-2',
      user_id: userId,
      action: 'api_key_created',
      resource_type: 'api_key',
      resource_id: 'key-1',
      details: { name: 'Production API' },
      ip_address: '192.168.1.100',
      created_at: '2025-01-01T00:00:00Z'
    }
  ];
}</content>
