export interface PasswordStrength {
  score: number; // 0 to 4
  label: 'Very Weak' | 'Weak' | 'Fair' | 'Good' | 'Strong';
  color: string;
  hasMinLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  isStrong: boolean;
}

export function evaluatePasswordStrength(password: string): PasswordStrength {
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  let score = 0;
  if (password.length >= 6) score += 1;
  if (hasMinLength && (hasUpper || hasLower)) score += 1;
  if (hasMinLength && hasUpper && hasLower && (hasNumber || hasSpecial)) score += 1;
  if (hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial) score += 1;

  let label: PasswordStrength['label'] = 'Very Weak';
  let color = 'bg-red-500 text-red-700 dark:text-red-300';

  if (score === 1) {
    label = 'Weak';
    color = 'bg-red-500 text-red-600 dark:text-red-400';
  } else if (score === 2) {
    label = 'Fair';
    color = 'bg-amber-500 text-amber-600 dark:text-amber-400';
  } else if (score === 3) {
    label = 'Good';
    color = 'bg-blue-500 text-blue-600 dark:text-blue-400';
  } else if (score === 4) {
    label = 'Strong';
    color = 'bg-emerald-500 text-emerald-600 dark:text-emerald-400';
  }

  const isStrong = hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial;

  return {
    score,
    label,
    color,
    hasMinLength,
    hasUpper,
    hasLower,
    hasNumber,
    hasSpecial,
    isStrong,
  };
}

export interface PasswordValidationResult {
  isValid: boolean;
  error?: string;
  reasons: string[];
}

/**
 * Validate whether a password satisfies strict strong security policies:
 * - 8+ characters minimum
 * - At least one uppercase letter (A-Z)
 * - At least one lowercase letter (a-z)
 * - At least one number (0-9)
 * - At least one special symbol (!@#$%^&*...)
 */
export function validateStrongPassword(password: string): PasswordValidationResult {
  const reasons: string[] = [];

  if (!password) {
    return {
      isValid: false,
      error: 'Password is required.',
      reasons: ['Password is empty'],
    };
  }

  if (password.length < 8) {
    reasons.push('at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    reasons.push('at least 1 uppercase letter (A-Z)');
  }
  if (!/[a-z]/.test(password)) {
    reasons.push('at least 1 lowercase letter (a-z)');
  }
  if (!/[0-9]/.test(password)) {
    reasons.push('at least 1 number (0-9)');
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    reasons.push('at least 1 special character (!@#$%^&*)');
  }

  if (reasons.length > 0) {
    return {
      isValid: false,
      error: `Strong password required: missing ${reasons.join(', ')}.`,
      reasons,
    };
  }

  return {
    isValid: true,
    reasons: [],
  };
}

/**
 * Validates that the confirmation password matches the primary password.
 */
export function validatePasswordMatch(password: string, confirmPassword: string): { isValid: boolean; error?: string } {
  if (!confirmPassword) {
    return {
      isValid: false,
      error: 'Please confirm your password.',
    };
  }

  if (password !== confirmPassword) {
    return {
      isValid: false,
      error: 'Passwords do not match. Please ensure both passwords are identical.',
    };
  }

  return { isValid: true };
}

export function generateStrongPassword(): string {
  const uppers = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lowers = 'abcdefghijkmnpqrstuvwxyz';
  const numbers = '23456789';
  const specials = '!@#$%^&*';

  // Words inspired by Amhara/Ethiopia media gateway
  const prefixes = ['Amhara', 'BahirDar', 'Gondar', 'Tana', 'Semien', 'Media', 'Ameco', 'Gateway', 'Citizen'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  
  const randUpper = uppers[Math.floor(Math.random() * uppers.length)];
  const randLower = lowers[Math.floor(Math.random() * lowers.length)];
  const randNum = Math.floor(100 + Math.random() * 900).toString();
  const randSpec = specials[Math.floor(Math.random() * specials.length)];
  const randSpec2 = specials[Math.floor(Math.random() * specials.length)];

  return `${prefix}${randSpec}${randNum}${randUpper}${randLower}${randSpec2}`;
}
