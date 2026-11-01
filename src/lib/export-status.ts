export type ExportState = 'queued' | 'processing' | 'completed' | 'completed_with_errors' | 'failed' | 'cancelled' | 'expired' | 'unknown';

const states = new Set<ExportState>(['queued', 'processing', 'completed', 'completed_with_errors', 'failed', 'cancelled', 'expired']);

export function exportState(status: string): ExportState {
  return states.has(status as ExportState) ? status as ExportState : 'unknown';
}

export function isExportTerminal(status: string) {
  return ['completed', 'completed_with_errors', 'failed', 'cancelled', 'expired'].includes(status);
}

export function canDownloadExport(status: string) {
  return status === 'completed' || status === 'completed_with_errors';
}
