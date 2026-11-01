import { describe, expect, it } from 'vitest';
import { filenameFromContentDisposition } from './downloads';

describe('download filenames', () => {
  it('decodes UTF-8 filenames and strips unsafe characters', () => {
    expect(filenameFromContentDisposition("attachment; filename*=UTF-8''audit%2Freport.zip", 'fallback.zip')).toBe('audit_report.zip');
  });

  it('uses the fallback when the header is absent or invalid', () => {
    expect(filenameFromContentDisposition(null, 'fallback.zip')).toBe('fallback.zip');
  });
});
