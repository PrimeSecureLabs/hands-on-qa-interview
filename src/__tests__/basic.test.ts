import { describe, it, expect } from 'vitest';

describe('Basic Test Suite', () => {
  it('should pass basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should validate environment variables in test', () => {
    expect(process.env.NODE_ENV).toBe('test');
    expect(process.env.STRIPE_SECRET_KEY).toBe(
      'sk_test_fake_key_for_testing_only'
    );
  });
});
