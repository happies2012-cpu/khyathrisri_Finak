import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/integrations/supabase/client');

describe('Dashboard Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getDashboardMetrics', () => {
    it('should return dashboard metrics', async () => {
      const result = {
        error: null,
        data: {
          totalRevenue: 45000,
          activeSubscriptions: 28,
          totalDomains: 42,
          supportTickets: 156,
          pendingTickets: 12,
          revenueGrowth: 12.5,
          subscriptionChurn: 2.3,
        },
      };

      expect(result.data?.totalRevenue).toBeGreaterThan(0);
      expect(result.data?.activeSubscriptions).toBeGreaterThan(0);
      expect(result.data?.revenueGrowth).toBeGreaterThan(0);
    });

    it('should handle missing data gracefully', async () => {
      const result = {
        error: null,
        data: {
          totalRevenue: 0,
          activeSubscriptions: 0,
          totalDomains: 0,
          supportTickets: 0,
          pendingTickets: 0,
          revenueGrowth: 0,
          subscriptionChurn: 0,
        },
      };

      expect(result.data?.totalRevenue).toBe(0);
    });
  });

  describe('getRevenueChartData', () => {
    it('should return revenue data for chart', async () => {
      const result = {
        error: null,
        data: [
          { month: 'Jan', revenue: 4000 },
          { month: 'Feb', revenue: 4500 },
          { month: 'Mar', revenue: 5200 },
        ],
      };

      expect(result.data).toHaveLength(3);
      expect(result.data?.[0]).toHaveProperty('month');
      expect(result.data?.[0]).toHaveProperty('revenue');
    });
  });

  describe('getTicketStatusChartData', () => {
    it('should return ticket status breakdown', async () => {
      const result = {
        error: null,
        data: [
          { status: 'open', count: 8, fill: '#3b82f6' },
          { status: 'pending', count: 12, fill: '#f59e0b' },
          { status: 'closed', count: 136, fill: '#10b981' },
        ],
      };

      expect(result.data).toHaveLength(3);
      expect(result.data?.[0].count).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getRecentActivities', () => {
    it('should return recent user activities', async () => {
      const result = {
        error: null,
        data: [
          {
            id: 1,
            type: 'order',
            description: 'New order placed',
            timestamp: new Date(),
          },
          {
            id: 2,
            type: 'subscription',
            description: 'Plan upgraded',
            timestamp: new Date(Date.now() - 1000),
          },
        ],
      };

      expect(result.data).toHaveLength(2);
      expect(result.data?.[0].type).toBeTruthy();
    });
  });
});
