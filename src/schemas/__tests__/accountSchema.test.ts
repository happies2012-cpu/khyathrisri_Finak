import { describe, it, expect } from 'vitest';
import { accountSchema } from '../validationSchemas';

describe('accountSchema', () => {
  describe('name validation', () => {
    it('accepts valid account name (3-50 chars)', () => {
      const result = accountSchema.safeParse({
        name: 'My Website',
        server_location: 'us-east',
      });
      expect(result.success).toBe(true);
    });

    it('rejects name under 3 characters', () => {
      const result = accountSchema.safeParse({
        name: 'ab',
        server_location: 'us-east',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('at least 3 characters');
      }
    });

    it('rejects name over 50 characters', () => {
      const result = accountSchema.safeParse({
        name: 'a'.repeat(51),
        server_location: 'us-east',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('50 characters');
      }
    });

    it('accepts name exactly 3 characters', () => {
      const result = accountSchema.safeParse({
        name: 'abc',
        server_location: 'us-west',
      });
      expect(result.success).toBe(true);
    });

    it('accepts name exactly 50 characters', () => {
      const result = accountSchema.safeParse({
        name: 'a'.repeat(50),
        server_location: 'eu-west',
      });
      expect(result.success).toBe(true);
    });

    it('accepts alphanumeric characters', () => {
      const result = accountSchema.safeParse({
        name: 'Website123',
        server_location: 'us-east',
      });
      expect(result.success).toBe(true);
    });

    it('accepts spaces in name', () => {
      const result = accountSchema.safeParse({
        name: 'My Awesome Website',
        server_location: 'us-east',
      });
      expect(result.success).toBe(true);
    });

    it('accepts hyphens in name', () => {
      const result = accountSchema.safeParse({
        name: 'my-awesome-website',
        server_location: 'us-east',
      });
      expect(result.success).toBe(true);
    });

    it('rejects special characters', () => {
      const specialChars = ['@', '#', '$', '%', '&', '*', '!', '?', '.', '/'];
      specialChars.forEach((char) => {
        const result = accountSchema.safeParse({
          name: `Website${char}Test`,
          server_location: 'us-east',
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors[0].message).toContain(
            'letters, numbers, spaces and hyphens only'
          );
        }
      });
    });

    it('rejects underscores', () => {
      const result = accountSchema.safeParse({
        name: 'my_website',
        server_location: 'us-east',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('server_location validation', () => {
    it('accepts valid server locations', () => {
      const locations = ['us-east', 'us-west', 'eu-west', 'ap-south'];
      locations.forEach((location) => {
        const result = accountSchema.safeParse({
          name: 'Test Site',
          server_location: location,
        });
        expect(result.success).toBe(true);
      });
    });

    it('rejects invalid server location', () => {
      const result = accountSchema.safeParse({
        name: 'Test Site',
        server_location: 'australia-south',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Invalid enum value');
      }
    });

    it('requires server_location field', () => {
      const result = accountSchema.safeParse({
        name: 'Test Site',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('complete account validation', () => {
    it('accepts complete valid account', () => {
      const result = accountSchema.safeParse({
        name: 'My Personal Website',
        server_location: 'eu-west',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('My Personal Website');
        expect(result.data.server_location).toBe('eu-west');
      }
    });

    it('accepts account with hyphens and numbers', () => {
      const result = accountSchema.safeParse({
        name: 'website-123 prod',
        server_location: 'us-east',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('website-123 prod');
      }
    });

    it('rejects account with multiple validation errors', () => {
      const result = accountSchema.safeParse({
        name: 'ab@#',
        server_location: 'invalid-location',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('handles leading/trailing spaces', () => {
      // Note: In real usage, trim() is called before validation
      const result = accountSchema.safeParse({
        name: '  My Website  ',
        server_location: 'us-east',
      });
      // This will fail because spaces are preserved during validation
      // Actual trim() happens in the component
      expect(result.success).toBe(true);
    });

    it('rejects empty name', () => {
      const result = accountSchema.safeParse({
        name: '',
        server_location: 'us-east',
      });
      expect(result.success).toBe(false);
    });
  });
});
