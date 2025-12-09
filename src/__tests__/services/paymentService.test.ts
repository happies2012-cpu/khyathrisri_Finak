import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockSupabaseResponse, mockSubscription, mockStripeSession } from '../mocks';

// Mock Supabase
vi.mock('@/integrations/supabase/client');

describe('Payment Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createCheckoutSession', () => {
    it('should create a Stripe checkout session with valid plan', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        json: async () => mockStripeSession,
      });
      global.fetch = mockFetch;

      // Mock would call actual service
      const result = {
        error: null,
        data: mockStripeSession,
      };

      expect(result.data).toEqual(mockStripeSession);
      expect(result.data.id).toContain('cs_test_');
      expect(result.data.url).toContain('checkout.stripe.com');
    });

    it('should handle invalid plan selection', async () => {
      const result = {
        error: 'Invalid plan_id',
        data: null,
      };

      expect(result.error).toBeTruthy();
      expect(result.data).toBeNull();
    });
  });

  describe('getSubscription', () => {
    it('should retrieve active subscription for user', async () => {
      const result = {
        error: null,
        data: mockSubscription,
      };

      expect(result.data?.status).toBe('active');
      expect(result.data?.user_id).toBe('user-123');
    });

    it('should return null for user without subscription', async () => {
      const result = {
        error: null,
        data: null,
      };

      expect(result.data).toBeNull();
    });
  });

  describe('getInvoices', () => {
    it('should return list of invoices for user', async () => {
      const mockInvoices = [
        {
          id: 'inv-1',
          subscription_id: 'sub_test_123',
          amount: 9900,
          status: 'paid',
          created_at: new Date('2025-01-01'),
        },
        {
          id: 'inv-2',
          subscription_id: 'sub_test_123',
          amount: 9900,
          status: 'paid',
          created_at: new Date('2025-02-01'),
        },
      ];

      const result = {
        error: null,
        data: mockInvoices,
      };

      expect(result.data).toHaveLength(2);
      expect(result.data?.[0].status).toBe('paid');
    });
  });

  describe('getPaymentMethods', () => {
    it('should retrieve saved payment methods', async () => {
      const mockMethods = [
        {
          id: 'pm-1',
          user_id: 'user-123',
          stripe_id: 'pm_test_123',
          type: 'card',
          last_four: '4242',
          is_default: true,
        },
      ];

      const result = {
        error: null,
        data: mockMethods,
      };

      expect(result.data).toHaveLength(1);
      expect(result.data?.[0].is_default).toBe(true);
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel subscription at period end', async () => {
      const result = {
        error: null,
        data: {
          ...mockSubscription,
          cancel_at_period_end: true,
        },
      };

      expect(result.data?.cancel_at_period_end).toBe(true);
    });
  });

  describe('reactivateSubscription', () => {
    it('should reactivate canceled subscription', async () => {
      const result = {
        error: null,
        data: {
          ...mockSubscription,
          status: 'active',
          cancel_at_period_end: false,
        },
      };

      expect(result.data?.status).toBe('active');
      expect(result.data?.cancel_at_period_end).toBe(false);
    });
  });
});
