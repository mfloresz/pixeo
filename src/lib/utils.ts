import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Sanitizes a base64 string for API consumption.
 * 1. Strips any "data:image/...;base64," prefix.
 * 2. Removes any whitespace or newlines.
 * 3. Ensures correct padding length.
 */
export function sanitizeBase64(b64: string): string {
  // Strip prefix if present
  let sanitized = b64.includes(',') ? b64.split(',')[1] : b64;

  // Remove whitespace
  sanitized = sanitized.replace(/\s/g, '');

  // Ensure padding is correct (length must be multiple of 4)
  const padNeeded = (4 - (sanitized.length % 4)) % 4;
  if (padNeeded > 0) {
    sanitized += '='.repeat(padNeeded);
  }

  return sanitized;
}
