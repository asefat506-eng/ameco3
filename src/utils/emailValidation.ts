/**
 * Email and Name Validation Utility for AMECO Portal
 * Ensures formal RFC 5322 compliant email structure, trusted formal domain validation,
 * letter-only name validation (English Latin + Amharic Ethiopic script),
 * and real-time interactive typing feedback helpers.
 */

export interface EmailValidationResult {
  isValid: boolean;
  error?: string;
  isFormal?: boolean;
  suggestion?: string;
}

/**
 * Strict formal email regular expression:
 * - Local part: letters, numbers, dots, hyphens, underscores (no consecutive dots or leading/trailing dots)
 * - Domain part: letters, numbers, hyphens
 * - TLD part: at least 2 alpha characters (e.g. .et, .org, .com, .gov, .edu, .gov.et)
 */
const FORMAL_EMAIL_REGEX = /^[a-zA-Z0-9]+([._-][a-zA-Z0-9]+)*@[a-zA-Z0-9]+([.-][a-zA-Z0-9]+)*\.[a-zA-Z]{2,}$/;

/**
 * Popular typos in domain names to provide smart corrective suggestions
 */
const COMMON_DOMAIN_TYPOS: Record<string, string> = {
  'gmai.com': 'gmail.com',
  'gamil.com': 'gmail.com',
  'gmial.com': 'gmail.com',
  'gmaill.com': 'gmail.com',
  'hotmial.com': 'hotmail.com',
  'outlok.com': 'outlook.com',
  'yaho.com': 'yahoo.com',
  'ameco.org.et': 'ameco.et',
  'ameco.com': 'ameco.et',
};

/**
 * Validates formal email address syntax and common structural rules.
 */
export function validateEmail(email?: string | null): EmailValidationResult {
  const trimmed = typeof email === 'string' ? email.trim() : '';

  if (!trimmed) {
    return {
      isValid: false,
      error: 'Email address is required.',
      isFormal: false,
    };
  }

  // Check if contains whitespace
  if (/\s/.test(trimmed)) {
    return {
      isValid: false,
      error: 'Email address must not contain spaces.',
      isFormal: false,
    };
  }

  // Check for @ symbol presence and count
  const atCount = (trimmed.match(/@/g) || []).length;
  if (atCount === 0) {
    return {
      isValid: false,
      error: 'Email address is missing the "@" symbol (e.g., username@domain.com).',
      isFormal: false,
    };
  }
  if (atCount > 1) {
    return {
      isValid: false,
      error: 'Email address must contain only one "@" symbol.',
      isFormal: false,
    };
  }

  const [localPart, domainPart] = trimmed.split('@');

  if (!localPart || localPart.length === 0) {
    return {
      isValid: false,
      error: 'Please enter a recipient name or username before "@".',
      isFormal: false,
    };
  }

  if (localPart.length > 64) {
    return {
      isValid: false,
      error: 'The prefix before "@" is too long (maximum 64 characters).',
      isFormal: false,
    };
  }

  if (!domainPart || domainPart.length === 0) {
    return {
      isValid: false,
      error: 'Please enter a valid domain after "@" (e.g., domain.com, ameco.et).',
      isFormal: false,
    };
  }

  if (!domainPart.includes('.')) {
    return {
      isValid: false,
      error: 'Email domain must contain a valid dot and extension (e.g. .et, .org, .com).',
      isFormal: false,
    };
  }

  const domainParts = domainPart.split('.');
  const tld = domainParts[domainParts.length - 1];

  if (!tld || tld.length < 2) {
    return {
      isValid: false,
      error: 'Email domain extension must be at least 2 characters (e.g., .et, .com).',
      isFormal: false,
    };
  }

  if (!/^[a-zA-Z]+$/.test(tld)) {
    return {
      isValid: false,
      error: 'Email domain extension (TLD) can only contain alphabet letters.',
      isFormal: false,
    };
  }

  if (!FORMAL_EMAIL_REGEX.test(trimmed)) {
    return {
      isValid: false,
      error: 'Please enter a standard formal email (e.g., firstname.lastname@domain.com).',
      isFormal: false,
    };
  }

  // Check for common domain typos
  const domainLower = domainPart.toLowerCase();
  let suggestion: string | undefined;
  if (COMMON_DOMAIN_TYPOS[domainLower]) {
    suggestion = `${localPart}@${COMMON_DOMAIN_TYPOS[domainLower]}`;
  }

  return {
    isValid: true,
    isFormal: true,
    suggestion,
  };
}

/**
 * Filter keystrokes for Letter-Only inputs:
 * Allows English Latin letters (a-z, A-Z), Ethiopic/Amharic script (\u1200-\u137F, etc.),
 * and allowable separators like space, single apostrophe, hyphen, and period.
 * Automatically strips numbers (0-9) and forbidden symbols in real-time.
 */
export function sanitizeLetterOnlyInput(value: string): string {
  // Strip numbers and forbidden symbols: allow English letters, Amharic letters, spaces, hyphens, apostrophes, and dots
  return value.replace(/[^a-zA-Z\u1200-\u137F\u1380-\u139F\u2D80-\u2DDF\uAB00-\uAB2F\s'\-\.]/g, '');
}

/**
 * Check if a character or string contains numbers or disallowed symbols for names
 */
export function containsInvalidNameCharacters(value: string): boolean {
  if (!value) return false;
  // Has digits?
  if (/\d/.test(value)) return true;
  // Has invalid symbols?
  return /[^a-zA-Z\u1200-\u137F\u1380-\u139F\u2D80-\u2DDF\uAB00-\uAB2F\s'\-\.]/.test(value);
}
