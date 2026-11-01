import { describe, expect, it } from 'vitest';
import { canDownloadExport, exportState, isExportTerminal } from './export-status';

describe('export state mapping', () => {
  it('distinguishes terminal and downloadable states', () => {
    expect(exportState('completed_with_errors')).toBe('completed_with_errors');
    expect(isExportTerminal('expired')).toBe(true);
    expect(canDownloadExport('failed')).toBe(false);
    expect(canDownloadExport('completed')).toBe(true);
  });
});
