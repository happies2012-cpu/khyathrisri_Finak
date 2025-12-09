import { vi } from 'vitest';

export const mockSupabase = {
  auth: {
    onAuthStateChange: vi.fn(),
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    verifyOtp: vi.fn(),
  },
  from: vi.fn(),
  channel: vi.fn(),
};

export const mockSupabaseQuery = {
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  single: vi.fn().mockReturnThis(),
};

export const createMockSupabaseResponse = (data: any, error: any = null) => ({
  data,
  error,
});

export const mockStripeSession = {
  id: 'cs_test_123',
  client_secret: 'cs_test_123_secret',
  url: 'https://checkout.stripe.com/pay/cs_test_123',
};

export const mockSubscription = {
  id: 'sub_test_123',
  user_id: 'user-123',
  plan_id: 'plan_basic',
  status: 'active',
  current_period_start: new Date(),
  current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  cancel_at_period_end: false,
  created_at: new Date(),
  updated_at: new Date(),
};

export const mockSessionInfo = {
  id: 'session-123',
  user_id: 'user-123',
  device_type: 'desktop',
  browser: 'Chrome',
  os: 'Windows',
  ip_address: '192.168.1.1',
  user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  last_activity: new Date(),
  created_at: new Date(),
  is_active: true,
};

export const mockDNSRecord = {
  id: 'dns-123',
  domain_name: 'example.com',
  type: 'A',
  name: '@',
  value: '192.0.2.1',
  ttl: 3600,
  priority: null,
  status: 'active',
  created_at: new Date(),
  updated_at: new Date(),
};

export const mockEmailLog = {
  id: 'email-123',
  user_id: 'user-123',
  template_type: 'welcome',
  recipient_email: 'user@example.com',
  subject: 'Welcome to KSFoundation',
  status: 'sent',
  sent_at: new Date(),
  opened_at: null,
  clicked_at: null,
  created_at: new Date(),
};
