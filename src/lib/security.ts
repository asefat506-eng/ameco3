import { ReportItem, PublicSafeTipView, PublicStatusUpdate } from '../types.ts';

// Character sets avoiding easily confused characters (0/O, 1/I/L)
const CODE_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

/**
 * Generate a random, non-sequential, non-Firestore Tracking Code.
 * Format: TIP-XXXXXX (e.g. TIP-8F42K9)
 */
export function generateTrackingCode(): string {
  let result = '';
  const bytes = new Uint8Array(6);
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(bytes);
    for (let i = 0; i < 6; i++) {
      result += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
    }
  } else {
    for (let i = 0; i < 6; i++) {
      result += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
    }
  }
  return `TIP-${result}`;
}

/**
 * Generate a random 6-character Secret Access Code.
 * Format: XXXXXX (e.g. 7H4K92)
 */
export function generateSecretAccessCode(): string {
  let result = '';
  const bytes = new Uint8Array(6);
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(bytes);
    for (let i = 0; i < 6; i++) {
      result += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
    }
  } else {
    for (let i = 0; i < 6; i++) {
      result += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
    }
  }
  return result;
}

/**
 * Computes a SHA-256 cryptographic hash of the input string.
 * Always normalizes string to uppercase and trimmed before hashing.
 */
export async function sha256Hex(text: string): Promise<string> {
  const normalized = text.trim().toUpperCase();
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(normalized);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  // Fallback simple hash for non-subtle crypto environments (deterministic string representation)
  let h1 = 0xdeadbeef ^ 0;
  let h2 = 0x41c6ce57 ^ 0;
  for (let i = 0; i < normalized.length; i++) {
    const ch = normalized.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(32, '0');
}

/**
 * Sanitizes a report item to create a strictly Public-Safe View for Guest tracking.
 * Strictly hides investigator personal info, internal notes, raw evidence, and citizen details.
 */
export function sanitizePublicTipView(report: ReportItem): PublicSafeTipView {
  const defaultUpdates: PublicStatusUpdate[] = report.publicStatusUpdates && report.publicStatusUpdates.length > 0
    ? report.publicStatusUpdates
    : [
        {
          id: 'PSU-INIT',
          timestamp: report.createdAt || report.incidentDate || 'Recently',
          message: 'Your submission has been securely received and queued for editorial verification.',
          stage: report.status,
        },
      ];

  return {
    id: report.id,
    trackingCode: report.trackingCode || report.id,
    title: report.title,
    category: report.category,
    incidentDate: report.incidentDate,
    zone: report.zone,
    woreda: report.woreda,
    submittedDate: report.createdAt || report.incidentDate || '',
    status: report.status,
    priority: report.priority,
    publicStatusUpdates: defaultUpdates,
    isPublished: report.status === 'Published' || Boolean(report.publishedReportTitle),
    publishedReport: report.publishedReportTitle
      ? {
          title: report.publishedReportTitle,
          summary: report.publishedReportSummary || '',
          date: report.publishedReportDate || report.updatedAt || '',
        }
      : undefined,
  };
}
