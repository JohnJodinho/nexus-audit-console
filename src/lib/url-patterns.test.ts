import { describe, expect, it } from 'vitest';
import { commitPattern, splitPatternInput } from './url-patterns';

describe('URL pattern input', () => {
  it('commits trimmed unique patterns', () => {
    expect(commitPattern('  /docs/** ', ['/blog/**'])).toEqual(['/blog/**', '/docs/**']);
    expect(commitPattern('/blog/**', ['/blog/**'])).toEqual(['/blog/**']);
  });

  it('commits comma-separated values and keeps the unfinished remainder', () => {
    expect(splitPatternInput('/docs/**,/blog/', [])).toEqual({ value: ['/docs/**'], remainder: '/blog/' });
  });
});
