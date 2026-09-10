/**
 * Utility functions for validating Egyptian phone numbers.
 *
 * Supported formats:
 * - Local mobile: 010, 011, 012, 015 followed by 8 digits (e.g. 01012345678)
 * - International: +20, 0020, or 20 followed by optional 0, then 10/11/12/15 and 8 digits
 * - Allows spaces, hyphens, parentheses, dots, and Arabic-Indic numerals (٠-٩).
 */

const normalizeDigits = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/[٠-٩]/g, (d) => (d.charCodeAt(0) - 1632).toString())
    .replace(/[۰-۹]/g, (d) => (d.charCodeAt(0) - 1776).toString());
};

const isValidEgyptianPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  const normalized = normalizeDigits(phone.trim());
  const cleaned = normalized.replace(/[\s\-().]/g, '');
  return /^(?:\+20|0020|20)?0?1[0125]\d{8}$/.test(cleaned);
};

module.exports = {
  normalizeDigits,
  isValidEgyptianPhone,
};
