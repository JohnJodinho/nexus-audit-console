export function filenameFromContentDisposition(header: string | null, fallback: string) {
  if (!header) return fallback;
  const encoded = header.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  const plain = header.match(/filename="?([^";]+)"?/i)?.[1];
  const candidate = encoded ?? plain;
  if (!candidate) return fallback;
  try {
    const decoded = decodeURIComponent(candidate).replace(/[/\\?%*:|"<>]/g, '_').trim();
    return decoded || fallback;
  } catch {
    return fallback;
  }
}
