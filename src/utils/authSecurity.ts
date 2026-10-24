import bcrypt from 'bcryptjs';
import { UserProfile } from '../types.ts';

const SALT_ROUNDS = 10;

/**
 * Checks if a string is already a valid bcrypt hash
 */
export function isBcryptHash(value: string | undefined | null): boolean {
  if (!value || typeof value !== 'string') return false;
  // Standard bcrypt hash format: $2a$, $2b$, or $2y$ with cost parameter and 53 char hash
  return /^\$2[abxy]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(value.trim());
}

/**
 * Hashes a plain text password using bcrypt (10 salt rounds)
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  if (!plainPassword) return '';
  const trimmed = plainPassword.trim();
  if (isBcryptHash(trimmed)) {
    return trimmed; // Already hashed
  }
  return await bcrypt.hash(trimmed, SALT_ROUNDS);
}

/**
 * Compares a plain-text password with a stored password (bcrypt hash or legacy plain-text fallback)
 */
export async function comparePassword(
  plainPassword: string,
  storedPasswordHashOrPlain: string | undefined | null
): Promise<{ matches: boolean; needsRehash: boolean }> {
  if (!storedPasswordHashOrPlain || !plainPassword) {
    return { matches: false, needsRehash: false };
  }

  const trimmedPlain = plainPassword.trim();
  const trimmedStored = storedPasswordHashOrPlain.trim();

  // 1. If stored password is a bcrypt hash, compare securely with bcrypt
  if (isBcryptHash(trimmedStored)) {
    try {
      const matches = await bcrypt.compare(trimmedPlain, trimmedStored);
      return { matches, needsRehash: false };
    } catch (err) {
      console.error('Error comparing bcrypt password:', err);
      return { matches: false, needsRehash: false };
    }
  }

  // 2. Legacy fallback: plain text comparison for auto-migration
  const matches = trimmedPlain === trimmedStored;
  return { matches, needsRehash: matches };
}

/**
 * Sanitizes a UserProfile object by completely removing the sensitive `password` field
 * before sending in HTTP responses or returning to client UI.
 */
export function sanitizeUser<T extends Partial<UserProfile> | null | undefined>(user: T): T {
  if (!user) return user;
  const clone = { ...user } as any;
  delete clone.password;
  return clone as T;
}

/**
 * Sanitizes an array of UserProfile objects
 */
export function sanitizeUsers(users: UserProfile[]): UserProfile[] {
  return users.map((u) => sanitizeUser(u));
}
