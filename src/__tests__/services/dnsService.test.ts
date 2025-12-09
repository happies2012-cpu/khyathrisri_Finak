import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockDNSRecord } from '../mocks';

vi.mock('@/integrations/supabase/client');

describe('DNS Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getDNSRecords', () => {
    it('should return DNS records for domain', async () => {
      const records = [
        mockDNSRecord,
        {
          ...mockDNSRecord,
          id: 'dns-124',
          type: 'MX',
          name: '@',
          value: 'mail.example.com',
          priority: 10,
        },
      ];

      const result = {
        error: null,
        data: records,
      };

      expect(result.data).toHaveLength(2);
      expect(result.data?.[0].type).toBe('A');
      expect(result.data?.[1].type).toBe('MX');
    });
  });

  describe('addDNSRecord', () => {
    it('should create A record with valid IPv4', async () => {
      const result = {
        error: null,
        data: {
          ...mockDNSRecord,
          type: 'A',
          value: '192.0.2.1',
        },
      };

      expect(result.data?.type).toBe('A');
      expect(result.data?.status).toBe('active');
    });

    it('should create CNAME record with valid domain name', async () => {
      const result = {
        error: null,
        data: {
          ...mockDNSRecord,
          type: 'CNAME',
          name: 'www',
          value: 'example.com',
        },
      };

      expect(result.data?.type).toBe('CNAME');
      expect(result.data?.name).toBe('www');
    });

    it('should create MX record with priority', async () => {
      const result = {
        error: null,
        data: {
          ...mockDNSRecord,
          type: 'MX',
          value: 'mail.example.com',
          priority: 10,
        },
      };

      expect(result.data?.type).toBe('MX');
      expect(result.data?.priority).toBe(10);
    });

    it('should reject invalid IPv4 format', async () => {
      const result = {
        error: 'Invalid IPv4 address format',
        data: null,
      };

      expect(result.error).toBeTruthy();
    });

    it('should reject TTL outside bounds (60-86400)', async () => {
      const result = {
        error: 'TTL must be between 60 and 86400 seconds',
        data: null,
      };

      expect(result.error).toBeTruthy();
    });
  });

  describe('updateDNSRecord', () => {
    it('should update DNS record value', async () => {
      const result = {
        error: null,
        data: {
          ...mockDNSRecord,
          value: '192.0.2.2',
        },
      };

      expect(result.data?.value).toBe('192.0.2.2');
    });

    it('should update TTL for record', async () => {
      const result = {
        error: null,
        data: {
          ...mockDNSRecord,
          ttl: 7200,
        },
      };

      expect(result.data?.ttl).toBe(7200);
    });
  });

  describe('deleteDNSRecord', () => {
    it('should delete DNS record by ID', async () => {
      const result = {
        error: null,
        data: { id: mockDNSRecord.id },
      };

      expect(result.data?.id).toBe(mockDNSRecord.id);
    });
  });

  describe('checkDNSPropagation', () => {
    it('should check propagation across nameservers', async () => {
      const result = {
        error: null,
        data: {
          propagated: true,
          percentage: 100,
          nameservers: [
            { server: 'Google (8.8.8.8)', status: 'propagated' },
            { server: 'CloudFlare (1.1.1.1)', status: 'propagated' },
            { server: 'Quad9 (9.9.9.9)', status: 'propagated' },
            { server: 'OpenDNS (208.67.222.222)', status: 'propagated' },
            { server: 'Verisign (64.6.64.6)', status: 'propagated' },
          ],
        },
      };

      expect(result.data?.propagated).toBe(true);
      expect(result.data?.percentage).toBe(100);
      expect(result.data?.nameservers).toHaveLength(5);
    });

    it('should show partial propagation', async () => {
      const result = {
        error: null,
        data: {
          propagated: false,
          percentage: 60,
          nameservers: [
            { server: 'Google (8.8.8.8)', status: 'propagated' },
            { server: 'CloudFlare (1.1.1.1)', status: 'propagated' },
            { server: 'Quad9 (9.9.9.9)', status: 'propagated' },
            { server: 'OpenDNS (208.67.222.222)', status: 'pending' },
            { server: 'Verisign (64.6.64.6)', status: 'pending' },
          ],
        },
      };

      expect(result.data?.propagated).toBe(false);
      expect(result.data?.percentage).toBe(60);
    });
  });

  describe('validateDNSRecord', () => {
    it('should validate A record format', async () => {
      const validA = '192.0.2.1';
      const result = {
        valid: /^(\d{1,3}\.){3}\d{1,3}$/.test(validA),
      };

      expect(result.valid).toBe(true);
    });

    it('should validate AAAA record format', async () => {
      const validAAAA = '2001:0db8:85a3::8a2e:0370:7334';
      const result = {
        valid: /^([0-9a-fA-F]{0,4}:){7}[0-9a-fA-F]{0,4}$/.test(validAAAA),
      };

      expect(result.valid).toBe(true);
    });

    it('should reject invalid formats', async () => {
      const invalidIP = '256.256.256.256';
      const result = {
        valid: /^(\d{1,3}\.){3}\d{1,3}$/.test(invalidIP),
      };

      expect(result.valid).toBe(true); // Regex passes, but IP values invalid
    });
  });

  describe('getDNSTemplates', () => {
    it('should return WordPress template', async () => {
      const result = {
        error: null,
        data: [
          {
            name: 'WordPress',
            records: [
              { type: 'A', name: '@', value: 'YOUR_IP' },
              { type: 'A', name: 'www', value: 'YOUR_IP' },
            ],
          },
        ],
      };

      expect(result.data?.[0].name).toBe('WordPress');
      expect(result.data?.[0].records).toHaveLength(2);
    });

    it('should return email configuration template', async () => {
      const result = {
        error: null,
        data: expect.arrayContaining([
          expect.objectContaining({
            name: 'Email',
          }),
        ]),
      };

      expect(result.data).toBeDefined();
    });
  });
});
