import { describe, expect, it } from 'vitest';
import { ApiError } from './client';

describe('API errors', () => {
  it('maps status codes to safe user-facing messages', () => {
    expect(new ApiError('backend detail', 429).userMessage).toContain('Too many requests');
    expect(new ApiError('backend detail', 422).userMessage).toBe('backend detail');
  });

  it('retains structured backend metadata', () => {
    const error = new ApiError('Invalid pattern', 422, undefined, { field: 'exclude_patterns', pattern: '/bad', index: 1, requestId: 'req-1' });
    expect(error.pattern).toBe('/bad');
    expect(error.index).toBe(1);
    expect(error.requestId).toBe('req-1');
  });
});
