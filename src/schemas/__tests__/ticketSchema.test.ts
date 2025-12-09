import { describe, it, expect } from 'vitest';
import { ticketSchema } from '../validationSchemas';

describe('ticketSchema', () => {
  describe('subject validation', () => {
    it('accepts valid subject (5-120 chars)', () => {
      const result = ticketSchema.safeParse({
        subject: 'My website is down',
        priority: 'high',
      });
      expect(result.success).toBe(true);
    });

    it('rejects subject under 5 characters', () => {
      const result = ticketSchema.safeParse({
        subject: 'Test',
        priority: 'low',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('at least 5 characters');
      }
    });

    it('rejects subject over 120 characters', () => {
      const result = ticketSchema.safeParse({
        subject: 'a'.repeat(121),
        priority: 'low',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('120 characters or less');
      }
    });

    it('accepts subject exactly 5 characters', () => {
      const result = ticketSchema.safeParse({
        subject: '12345',
        priority: 'low',
      });
      expect(result.success).toBe(true);
    });

    it('accepts subject exactly 120 characters', () => {
      const result = ticketSchema.safeParse({
        subject: 'a'.repeat(120),
        priority: 'low',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('description validation', () => {
    it('accepts empty/optional description', () => {
      const result = ticketSchema.safeParse({
        subject: 'Issue with server',
        priority: 'medium',
      });
      expect(result.success).toBe(true);
    });

    it('accepts description up to 2000 characters', () => {
      const result = ticketSchema.safeParse({
        subject: 'Server issue',
        description: 'a'.repeat(2000),
        priority: 'medium',
      });
      expect(result.success).toBe(true);
    });

    it('rejects description over 2000 characters', () => {
      const result = ticketSchema.safeParse({
        subject: 'Server issue',
        description: 'a'.repeat(2001),
        priority: 'medium',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('2000 characters or less');
      }
    });

    it('accepts null description', () => {
      const result = ticketSchema.safeParse({
        subject: 'Issue',
        description: null,
        priority: 'low',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('priority validation', () => {
    it('accepts valid priority values', () => {
      const priorities = ['low', 'medium', 'high', 'urgent'];
      priorities.forEach((priority) => {
        const result = ticketSchema.safeParse({
          subject: 'Test issue',
          priority,
        });
        expect(result.success).toBe(true);
      });
    });

    it('rejects invalid priority value', () => {
      const result = ticketSchema.safeParse({
        subject: 'Test issue',
        priority: 'critical',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Invalid enum value');
      }
    });

    it('requires priority field', () => {
      const result = ticketSchema.safeParse({
        subject: 'Test issue',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('complete ticket validation', () => {
    it('accepts complete valid ticket', () => {
      const result = ticketSchema.safeParse({
        subject: 'Database connection timeout',
        description:
          'Our application is experiencing intermittent database connection timeouts',
        priority: 'urgent',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.subject).toBe('Database connection timeout');
        expect(result.data.priority).toBe('urgent');
      }
    });

    it('rejects ticket with multiple validation errors', () => {
      const result = ticketSchema.safeParse({
        subject: 'Bad',
        description: 'a'.repeat(2001),
        priority: 'invalid',
      });
      expect(result.success).toBe(false);
    });
  });
});
