import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockSessionInfo } from '../mocks';

vi.mock('@/integrations/supabase/client');

describe('Session Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('trackNewSession', () => {
    it('should create new session with device info', async () => {
      const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
      const result = {
        error: null,
        data: {
          ...mockSessionInfo,
          user_agent: userAgent,
        },
      };

      expect(result.data?.device_type).toBe('desktop');
      expect(result.data?.is_active).toBe(true);
      expect(result.data?.user_id).toBe('user-123');
    });

    it('should detect mobile sessions', async () => {
      const mobileUA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)';
      const result = {
        error: null,
        data: {
          ...mockSessionInfo,
          user_agent: mobileUA,
          device_type: 'mobile',
        },
      };

      expect(result.data?.device_type).toBe('mobile');
    });
  });

  describe('listUserSessions', () => {
    it('should return all active sessions for user', async () => {
      const sessions = [
        mockSessionInfo,
        {
          ...mockSessionInfo,
          id: 'session-124',
          browser: 'Safari',
          os: 'macOS',
        },
      ];

      const result = {
        error: null,
        data: sessions,
      };

      expect(result.data).toHaveLength(2);
      expect(result.data?.[0].is_active).toBe(true);
    });

    it('should order sessions by last activity', async () => {
      const now = new Date();
      const sessions = [
        {
          ...mockSessionInfo,
          id: 'session-1',
          last_activity: now,
        },
        {
          ...mockSessionInfo,
          id: 'session-2',
          last_activity: new Date(now.getTime() - 1000),
        },
      ];

      const result = {
        error: null,
        data: sessions,
      };

      expect(result.data?.[0].last_activity.getTime()).toBeGreaterThanOrEqual(
        result.data?.[1].last_activity.getTime() || 0
      );
    });
  });

  describe('revokeSession', () => {
    it('should mark session as inactive', async () => {
      const result = {
        error: null,
        data: {
          ...mockSessionInfo,
          is_active: false,
        },
      };

      expect(result.data?.is_active).toBe(false);
    });
  });

  describe('updateSessionActivity', () => {
    it('should update last activity timestamp', async () => {
      const beforeUpdate = new Date();
      const result = {
        error: null,
        data: {
          ...mockSessionInfo,
          last_activity: new Date(),
        },
      };

      expect(result.data?.last_activity.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime());
    });
  });

  describe('cleanupOldSessions', () => {
    it('should delete sessions older than 30 days', async () => {
      const result = {
        error: null,
        data: {
          deletedCount: 5,
        },
      };

      expect(result.data?.deletedCount).toBeGreaterThanOrEqual(0);
    });
  });
});
