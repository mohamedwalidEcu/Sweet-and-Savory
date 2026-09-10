
export function normalizeDigits(str: string): string {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/[٠-٩]/g, (d) => (d.charCodeAt(0) - 1632).toString())
    .replace(/[۰-۹]/g, (d) => (d.charCodeAt(0) - 1776).toString());
}

export function isValidEgyptianPhone(phone: string | null | undefined): boolean {
  if (!phone || typeof phone !== 'string') return false;
  const normalized = normalizeDigits(phone.trim());
  const cleaned = normalized.replace(/[\s\-().]/g, '');
  return /^(?:\+20|0020|20)?0?1[0125]\d{8}$/.test(cleaned);
}
