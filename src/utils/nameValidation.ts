/**
 * Name Validation Utility for AMECO Portal
 * Validates names in English (Latin alphabet) and Amharic (Ethiopic/Ge'ez script).
 */

// Ethiopic Unicode blocks:
// \u1200-\u137F: Ethiopic main block
// \u1380-\u139F: Ethiopic Supplement
// \u2D80-\u2DDF: Ethiopic Extended
// \uAB00-\uAB2F: Ethiopic Extended-A
const AMHARIC_REGEX = /[\u1200-\u137F\u1380-\u139F\u2D80-\u2DDF\uAB00-\uAB2F]/;
const ENGLISH_REGEX = /[a-zA-Z]/;

// Strictly allowed text characters in names:
// English letters, Amharic/Ethiopic letters, space, hyphen, apostrophe, and period
const VALID_NAME_REGEX = /^[a-zA-Z\u1200-\u137F\u1380-\u139F\u2D80-\u2DDF\uAB00-\uAB2F\s'\-\.]+$/;

export interface NameValidationResult {
  isValid: boolean;
  error?: string;
  detectedScript?: 'english' | 'amharic' | 'mixed' | 'none';
}

/**
 * Detect script used in name text
 */
export function detectNameScript(name?: string | null): 'english' | 'amharic' | 'mixed' | 'none' {
  if (!name || typeof name !== 'string' || !name.trim()) return 'none';
  const hasAmharic = AMHARIC_REGEX.test(name);
  const hasEnglish = ENGLISH_REGEX.test(name);
  if (hasAmharic && hasEnglish) return 'mixed';
  if (hasAmharic) return 'amharic';
  if (hasEnglish) return 'english';
  return 'none';
}

/**
 * Filter out numbers and disallowed special characters in real-time as user writes
 */
export function filterLettersOnly(input: string): { cleaned: string; hadInvalidChar: boolean; invalidCharMessage?: string } {
  if (!input) return { cleaned: '', hadInvalidChar: false };
  
  if (/\d/.test(input)) {
    const cleaned = input.replace(/\d/g, '');
    return {
      cleaned,
      hadInvalidChar: true,
      invalidCharMessage: 'Numbers (0-9) are not allowed in names. Letters only.',
    };
  }

  const cleaned = input.replace(/[^a-zA-Z\u1200-\u137F\u1380-\u139F\u2D80-\u2DDF\uAB00-\uAB2F\s'\-\.]/g, '');
  const hadInvalidChar = cleaned.length !== input.length;

  return {
    cleaned,
    hadInvalidChar,
    invalidCharMessage: hadInvalidChar
      ? 'Special symbols are not allowed in names. Please use letters only.'
      : undefined,
  };
}

/**
 * Validate that a first name, last name, or full name is text-only (Amharic or English)
 * and does not contain numbers or arbitrary punctuation.
 */
export function validateName(name?: string | null, fieldName: string = 'Name'): NameValidationResult {
  const trimmed = typeof name === 'string' ? name.trim() : '';

  if (!trimmed) {
    return {
      isValid: false,
      error: `${fieldName} is required.`,
      detectedScript: 'none',
    };
  }

  if (trimmed.length < 2) {
    return {
      isValid: false,
      error: `${fieldName} must be at least 2 characters.`,
      detectedScript: detectNameScript(trimmed),
    };
  }

  // Check for digits
  if (/\d/.test(trimmed)) {
    return {
      isValid: false,
      error: `${fieldName} cannot contain numbers (0-9). Letters only.`,
      detectedScript: detectNameScript(trimmed),
    };
  }

  // Check for invalid symbols
  if (!VALID_NAME_REGEX.test(trimmed)) {
    return {
      isValid: false,
      error: `${fieldName} contains invalid characters. Only standard letters (English/Amharic) are permitted.`,
      detectedScript: detectNameScript(trimmed),
    };
  }

  return {
    isValid: true,
    detectedScript: detectNameScript(trimmed),
  };
}

/**
 * Quick boolean check if string is valid name text
 */
export function isValidNameText(name: string): boolean {
  return validateName(name).isValid;
}

